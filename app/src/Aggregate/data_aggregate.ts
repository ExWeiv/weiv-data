import { Document } from "mongodb/mongodb";
import { checkPipelineArray, sortAggregationPipeline, } from "../Helpers/pipeline_helpers";
import { WeivDataFilter } from "../Filter/data_filter";
import { AggregateResult } from './data_aggregate_result';
import { WeivDataAggregateRunOptions, WeivDataAggregateResult } from "@exweiv/weiv-data";

/** @internal */
export type PipelineGroupObject<T> = {
    _id?: T;
    [key: string]: any;
    $group?: object;
};

export class WeivDataAggregate extends AggregateResult {
    private limitNumber!: number;
    private skipNumber!: number;
    private currentGroup!: PipelineGroupObject<string | object>;
    private sorting!: { propertyName: string; type: 1 | -1; };
    private groupCreated!: boolean;
    private countCalled!: boolean;
    private havingFilter!: { $match: object; };

    /** @internal */
    constructor(collectionId: string) {
        if (!collectionId) {
            throw new Error(`WeivData - Database and Collection name required`);
        }

        super(collectionId);
    }

    ascending(propertyName: string): WeivDataAggregate {
        if (!propertyName) {
            throw new Error(`WeivData - Property name required!`);
        }
        this.sorting = {
            propertyName,
            type: 1,
        };
        return this;
    }

    avg(propertyName: string, projectedName = `${propertyName}Avg`): WeivDataAggregate {
        if (!propertyName) {
            throw new Error(`WeivData - Property name is required!`);
        }
        this.addGroup({
            _id: "0",
            [projectedName]: {
                $avg: `$${propertyName}`,
            },
        });
        return this;
    }

    count(): WeivDataAggregate {
        this.countCalled = true;
        return this;
    }

    descending(propertyName: string): WeivDataAggregate {
        if (!propertyName) {
            throw new Error(`WeivData - Property name is required!`);
        }
        this.sorting = {
            propertyName,
            type: -1,
        };
        return this;
    }

    filter(filter: WeivDataFilter): WeivDataAggregate {
        if (!filter) {
            throw new Error(`WeivData - Filter is empty, please add a filter using weivData.filter method!`);
        }
        this.pipeline = checkPipelineArray(this.pipeline);
        this.pipeline.push({
            $match: {
                ...filter.filters,
            },
        });
        return this;
    }

    group(...propertyName: string[]): WeivDataAggregate {
        if (!propertyName) {
            throw new Error(`WeivData - Property or properties are required!`);
        }
        if (this.groupCreated === true) {
            throw new Error(`WeivData - Group is already set!`);
        }

        let propertyNames: { [key: string]: string } = {};
        if (typeof propertyName === "string") {
            propertyNames[propertyName] = `$${propertyName}`;
        } else if (Array.isArray(propertyName)) {
            for (const name of propertyName) {
                propertyNames[name] = `$${name}`;
            }
        }

        this.addGroup(
            {
                ...propertyNames,
            },
            true
        );

        this.groupCreated = true;
        return this;
    }

    having(filter: WeivDataFilter): WeivDataAggregate {
        if (!filter) {
            throw new Error(`WeivData - Filter is empty, please add a filter using weivData.filter method!`);
        }
        this.havingFilter = {
            $match: {
                ...filter.filters,
            },
        };
        return this;
    }

    limit(limit: number): WeivDataAggregate {
        if (!limit && limit != 0) {
            throw new Error(`WeivData - Limit number is required please specify a limit amount`);
        }

        if (limit != 0) {
            this.limitNumber = limit;
        }

        return this;
    }

    max(propertyName: string, projectedName = `${propertyName}Max`): WeivDataAggregate {
        if (!propertyName) {
            throw new Error(`WeivData - Property name is required!`);
        }
        this.addGroup({
            _id: "0",
            [projectedName]: {
                $max: `$${propertyName}`,
            },
        });
        return this;
    }

    min(propertyName: string, projectedName = `${propertyName}Min`): WeivDataAggregate {
        if (!propertyName) {
            throw new Error(`WeivData - Property name is required!`);
        }
        this.addGroup({
            _id: "0",
            [projectedName]: {
                $min: `$${propertyName}`,
            },
        });
        return this;
    }

    async run(options?: WeivDataAggregateRunOptions): Promise<WeivDataAggregateResult> {
        // Get the options passed with run() and then connect to client and get memberId (if there is a memberId) and also pass suppressAuth option
        const { suppressAuth, readConcern } = options || {};
        const { collection } = await this.connectionHandler(suppressAuth);

        if (this.sorting) {
            this.pipeline = checkPipelineArray(this.pipeline);
            this.pipeline.push({
                $sort: {
                    [this.sorting.propertyName]: this.sorting.type
                }
            })
        }

        // Sort pipeline based on priority order of pipeline.
        this.pipeline = sortAggregationPipeline(this.pipeline);

        // Fix the sorting if aggregation includes a group and sorting
        if (this.currentGroup && this.sorting) {
            if (this.currentGroup["$group"]) { //@ts-ignore
                if (this.currentGroup["$group"]._exweivDocument) {
                    this.pipeline.push({
                        $sort: {
                            [`_exweivDocument.${this.sorting.propertyName}`]:
                                this.sorting.type,
                        },
                    });
                }
            }
        }

        // Enable total count calculator if count() is added to aggregation
        if (this.countCalled === true) {
            const keys = Object.keys(this.pipeline);
            for (const key of keys) { //@ts-ignore
                const data = this.pipeline[key];
                if (data["$group"]) {
                    data["$group"].count = {
                        $sum: 1,
                    };
                }
            }
        }

        // Add having filters to end of the pipeline to filter grouped results only
        if (this.havingFilter && this.currentGroup) {
            this.pipeline.push(this.havingFilter);
        }

        // Create the aggregation on the current collection
        const aggregation = collection.aggregate(this.pipeline);

        // Add skip if there is a skip set
        if (this.skipNumber) {
            aggregation.skip(this.skipNumber);
        }

        // Add limit if there is a limit set
        if (this.limitNumber) {
            aggregation.limit(this.limitNumber);
        }

        // Enable read consistency if readConcern enabled via run options
        if (readConcern) {
            aggregation.withReadConcern(readConcern);
        }

        // Make the call to the MongoDB and convert it to an array via result function
        const aggregateResult = await this.getResult(suppressAuth);

        // Modify result of call
        let modifiedItems = aggregateResult.items.map((document: Document) => {
            // Check if there is a field called _exweivDocument if so extract the fields in it (except _id) and add it to main array if there is not a field called _exweivDocument return the item
            if (document._exweivDocument) {
                const _exweivDocumentExtracted = document._exweivDocument;
                delete _exweivDocumentExtracted._id;
                delete document._exweivDocument;
                return {
                    ...document,
                    ..._exweivDocumentExtracted,
                };
            } else {
                return document;
            }
        });

        // Return the WeivDataAggregateResult
        return {
            ...aggregateResult,
            items: modifiedItems,
        };
    }

    skip(skip: number): WeivDataAggregate {
        if (!skip && skip != 0) {
            throw new Error(`WeivData - Skip number is required please specify a skip number`);
        }

        this.skipNumber = skip;
        return this;
    }

    sum(propertyName: string, projectedName = `${propertyName}Sum`): WeivDataAggregate {
        if (!propertyName) {
            throw new Error(`WeivData - Property name is required!`)
        }

        this.addGroup({
            _id: "0",
            [projectedName]: {
                $sum: `$${propertyName}`,
            },
        });
        return this;
    }

    /**@internal */
    private setCurrentGroup() {
        this.pipeline = checkPipelineArray(this.pipeline);  //@ts-ignore
        this.currentGroup = this.pipeline.find(stage => stage["$group"]);
        if (this.currentGroup) {
            return this.currentGroup;
        } else {
            this.currentGroup = {};
            return undefined;
        }
    }

    /**@internal */
    private addGroup(groupObject: PipelineGroupObject<string | object>, isGroup?: boolean) {
        const currentGroup = this.setCurrentGroup(); //@ts-ignore
        this.pipeline = this.pipeline.filter((stage) => !stage["$group"]);

        if (!currentGroup) {
            if (isGroup != true) {
                this.currentGroup = {
                    ...groupObject,
                    ...this.currentGroup,
                };
            } else {
                this.currentGroup = {
                    ...this.currentGroup,
                    _id: groupObject,
                    _exweivDocument: { $first: "$$ROOT" },
                };
            }

            this.pipeline.push({ $group: this.currentGroup });
        } else {
            if (isGroup != true) {
                this.currentGroup["$group"] = {
                    ...groupObject,
                    ...this.currentGroup["$group"],
                };
            } else {
                this.currentGroup["$group"] = {
                    ...this.currentGroup["$group"],
                    _id: groupObject,
                    _exweivDocument: { $first: "$$ROOT" },
                };
            }

            this.pipeline.push({ $group: this.currentGroup["$group"] });
        }
    }
}