import { WeivDataFilter } from "../Filter/data_filter";
import { isArray } from "lodash";
import { copyOwnPropsOnly } from "../Helpers/validator";
import { type Collection, type Db } from 'mongodb';
import { CollectionID, Item, PipelineStage, WeivDataAggregateResult, WeivDataAggregateRunOptions } from "@exweiv/weiv-data";
import { connectionHandler } from "../Helpers/connection_helpers";
import { recursivelyConvertIds } from "../Helpers/internal_id_converter";
import { kaptanLogar } from "../Errors/error_manager";

class Aggregate {
    protected readonly _collectionId: CollectionID;
    protected _pipeline: PipelineStage[] = new Array();
    protected _limitNumber: number = 50;
    protected _skipNumber: number = 0;

    constructor(collectionId: CollectionID) {
        this._collectionId = collectionId;
    }

    filter(filter: WeivDataFilter): Aggregate {
        try {
            if (!filter || typeof filter !== "object") {
                kaptanLogar("00023", `filter is empty, please add a filter using weivData.filter method! (filter undefined or not valid)`);
            } else {
                // Clear Prototype Pollution
                // const filterClass = copyOwnPropsOnly(filter); IT WAS A BUG REASON
                const filters = copyOwnPropsOnly(filter._filters);

                // Add Filtering Stage to Agg Pipeline
                this._pipeline.push(filters);
                return this;
            }
        } catch (err) {
            kaptanLogar("00023", "while adding filter to aggregate pipeline");
        }
    }

    ascending(...propertyName: string[]): Aggregate {
        // Adds an ascending sort via helper function.
        return this._addSort_(propertyName, 1);
    }

    descending(...propertyName: string[]): Aggregate {
        // Adds an descending sort via helper function.
        return this._addSort_(propertyName, -1);
    }

    group(...propertyName: string[]): Aggregate {
        if (!propertyName || !isArray(propertyName)) {
            kaptanLogar("00023", `at least one group property name is required! (propertyName is undefined or not valid)`);
        } else {
            // Loop all group values and save them here
            const groups: { [key: string]: string } = {};
            for (const name of propertyName) {
                if (typeof name === "string") {
                    groups[name] = `$${name}`;
                } else {
                    kaptanLogar("00023", `property names must be a string, propertyName value is not valid!`);
                }
            }

            // Return current group stage of pipeline;
            let currentGroupStage = this._pipeline.filter(stage => "$group" in stage)[0];

            if (currentGroupStage) {
                currentGroupStage = {
                    "$group": {
                        ...currentGroupStage["$group"],
                        _id: {
                            ...groups
                        }
                    }
                }
            } else {
                currentGroupStage = {
                    "$group": {
                        _id: {
                            ...groups
                        }
                    }
                }
            }

            // Clear old group stage and push new group stage
            this._pipeline = this._pipeline.filter(stage => !("$group" in stage));
            this._pipeline.push(currentGroupStage);
            return this;
        }
    }

    limit(limit: number): Aggregate {
        if (typeof limit !== "number") {
            this._limitNumber = this._limitNumber;
        } else {
            this._limitNumber = limit;
        }

        return this;
    }

    skip(skip: number): Aggregate {
        if (typeof skip !== "number") {
            this._skipNumber = this._skipNumber;
        } else {
            this._skipNumber = skip;
        }

        return this;
    }

    avg(propertyName: string, projectedName?: string): Aggregate {
        return this._addCalculation_(propertyName, `${!projectedName ? propertyName + "Avg" : projectedName}`, "$avg");
    }

    count(): Aggregate {
        // Replace pipeline by adding count into each group stage
        this._pipeline = this._pipeline.map((stage) => {
            if (stage["$group"]) {
                if (!stage["$group"]["count"]) {
                    return {
                        "$group": {
                            ...stage["$group"],
                            count: {
                                "$sum": 1
                            }
                        }
                    }
                }
            }
            return stage;
        });

        return this;
    }

    max(propertyName: string, projectedName?: string): Aggregate {
        return this._addCalculation_(propertyName, `${!projectedName ? propertyName + "Max" : projectedName}`, "$max");
    }

    min(propertyName: string, projectedName?: string): Aggregate {
        return this._addCalculation_(propertyName, `${!projectedName ? propertyName + "Min" : projectedName}`, "$min");
    }

    sum(propertyName: string, projectedName?: string): Aggregate {
        return this._addCalculation_(propertyName, `${!projectedName ? propertyName + "Sum" : projectedName}`, "$sum");
    }

    stage(...stages: PipelineStage[]): Aggregate {
        if (!stages || !isArray(stages)) {
            kaptanLogar("00023", `each stage must be a valid stage object!`);
        } else {
            for (const stage of stages) {
                const safeStage = copyOwnPropsOnly(stage);
                this._pipeline.push(safeStage);
            }
            return this;
        }
    }

    // HELPER FUNCTIONS
    private _addSort_(propertyName: string[], type: number): Aggregate {
        if (!propertyName || !isArray(propertyName)) {
            kaptanLogar("00023", `at least one property name is required! (propertyName is undefined or not valid)`);
        } else {
            // Loop All Sort Fields and Save
            const sort = {
                "$sort": {}
            };

            for (const name of propertyName) {
                if (typeof name === "string") {
                    sort["$sort"] = {
                        ...sort["$sort"],
                        [name]: type
                    }
                } else {
                    kaptanLogar("00023", `property names must be a string, propertyName value is not valid!`);
                }
            }

            // Push Sort to Agg Pipeline
            this._pipeline.push(sort);
            return this;
        }
    }

    private _addCalculation_(propertyName: string, projectedName: string, type: string): Aggregate {
        if (!propertyName || typeof propertyName !== "string" || typeof projectedName !== "string") {
            kaptanLogar("00023", `invalid value for propertyName projectedName or it's either undefined or not a string!`);
        } else {
            // Return current group stage of pipeline;
            let currentGroupStage = this._pipeline.filter(stage => "$group" in stage)[0];

            // Update group stage with calculation methods (.group is always creates a new group and should be used once)
            if (currentGroupStage) {
                currentGroupStage = {
                    "$group": {
                        _id: null,
                        ...currentGroupStage["$group"],
                        [projectedName]: {
                            [type]: `$${propertyName}`
                        }
                    }
                }
            } else {
                currentGroupStage = {
                    "$group": {
                        _id: null,
                        [projectedName]: {
                            [type]: `$${propertyName}`
                        }
                    }
                }
            }

            // Clear old group stage and push new group stage
            this._pipeline = this._pipeline.filter((stage) => {
                return !stage["$group"];
            });
            this._pipeline.push(currentGroupStage);
            return this;
        }
    }
}

export class AggregateResult extends Aggregate {
    // Internal
    private _collection!: Collection;
    private _database!: Db;
    private _pageSize: number = 50;
    private _currentPage: number = 1;

    async run(options: WeivDataAggregateRunOptions): Promise<WeivDataAggregateResult<Item>> {
        try {
            const { readConcern, suppressAuth, convertIds } = options || {};
            await this._handleConnection_(suppressAuth);

            // Copy pipeline (not reference copy, deep copy)
            const pipeline = [...this._pipeline];

            // Set limit and skip counts before aggregate object defined
            this._pageSize = this._limitNumber || 50;
            const skip = { $skip: this._skipNumber || 0 + ((this._currentPage - 1) * this._pageSize) };
            const limit = { $limit: this._pageSize };

            // Push skip and limit to pipeline
            pipeline.push(skip);
            pipeline.push(limit);

            const items: Item[] = await this._collection.aggregate(pipeline, { readConcern }).toArray();
            const length: number = items.length;
            const hasNext: () => boolean = () => this._currentPage * this._pageSize < items.length;
            const next: () => Promise<WeivDataAggregateResult<Item>> = async () => {
                try {
                    this._currentPage++;
                    return await this.run(options)
                } catch (err) {
                    kaptanLogar("00023", `couldn't get the next page of the items!`);
                }
            }

            return {
                items: convertIds ? recursivelyConvertIds(items) : items,
                length,
                hasNext,
                next,
                pipeline
            }
        } catch (err) {
            kaptanLogar("00023", `when running the aggregation pipeline! Pipeline: ${this._pipeline}, Details: ${err}`);
        }
    }

    // Set CollectionID
    constructor(collectionId: CollectionID) {
        if (!collectionId || typeof collectionId !== "string") {
            kaptanLogar("00007");
        }
        super(collectionId);
    }

    // HELPER FUNCTIONS
    private async _handleConnection_(suppressAuth?: boolean): Promise<void> {
        if (!this._collection || !this._database) {
            const { collection, database } = await connectionHandler(this._collectionId, suppressAuth);
            this._database = database;
            this._collection = collection;
        }
    }
}