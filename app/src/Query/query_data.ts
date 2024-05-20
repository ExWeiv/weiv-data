import { CollectionID, IncludeObject, Item, PipelineStage, WeivDataOptions, WeivDataQueryResult } from "@exweiv/weiv-data";
import { WeivDataFilter } from '../Filter/data_filter'
import { isArray, isEmpty, merge } from "lodash";
import { copyOwnPropsOnly } from "../Helpers/validator";
import { connectionHandler } from "../Helpers/connection_helpers";
import { Collection, Db } from "mongodb";
import { prepareHookContext } from "../Helpers/hook_helpers";
import { runDataHook } from "../Hooks/hook_manager";

class Query extends WeivDataFilter {
    protected readonly _collectionId: CollectionID;
    protected _sort: Map<string, 1 | -1> = new Map();
    protected _fields: string[] = new Array();
    protected _includes: IncludeObject[] = new Array();

    protected _limitNumber: number = 50;
    protected _skipNumber: number = 0;
    protected _isAggregate: boolean = false;

    constructor(collectionId: CollectionID) {
        super();
        this._collectionId = collectionId;
    }

    ascending(...propertyName: string[]): Query {
        if (!propertyName || !isArray(propertyName)) {
            throw new Error(`WeivData - propertyName is not a valid value!`);
        }

        // Save sort details with helper function
        this.__addSort__(1, propertyName);
        return this;
    }

    descending(...propertyName: string[]): Query {
        if (!propertyName || !isArray(propertyName)) {
            throw new Error(`WeivData - propertyName is not a valid value!`);
        }

        // Save sort details with helper function
        this.__addSort__(-1, propertyName);
        return this;
    }

    limit(limit: number): Query {
        if (typeof limit !== "number") {
            throw new Error(`WeivData - Unvalid value for limit it's either undefined or not a number!`);
        } else {
            this._limitNumber = limit;
            return this;
        }
    }

    skip(skip: number): Query {
        if (typeof skip !== "number") {
            throw new Error(`WeivData - Unvalid value for skip it's either undefined or not a number!`);
        } else {
            this._skipNumber = skip;
            return this;
        }
    }

    fields(...propertyName: string[]): Query {
        if (!propertyName || !isArray(propertyName)) {
            throw new Error(`WeivData - propertyName is not a valid value!`);
        }

        // Iterate over all names and push them to fields arr
        for (const name of propertyName) {
            if (typeof name !== "string") {
                throw new Error(`WeivData - propertyName doesn't contain value/s!`);
            } else {
                this._fields.push(name);
            }
        }

        // Mark aggregate enabled since we have run fields it means we need to run an aggregation instead of find
        this._isAggregate = true;
        return this;
    }

    include(...includes: IncludeObject[]): Query {
        if (!includes || !isArray(includes)) {
            throw new Error(`WeivData - include is not a valid value!`);
        }

        // Iterate over all includes and checks for values and types for required ones
        for (const include of includes) {
            if (typeof include !== "object") {
                throw new Error(`WeivData - include values must be an object ${include} is not a valid value!`);
            } else {
                if (!include["collectionName"] || !include["fieldName"] || typeof include["collectionName"] !== "string" || typeof include["fieldName"] !== "string") {
                    throw new Error(`WeivData - each include object must contain collectionName and fieldName values as string!`);
                }

                // Prototype pollution clearer
                const safeInclude = copyOwnPropsOnly<IncludeObject>(include);
                this._includes.push(safeInclude);
            }
        }

        // Mark aggreate enabled and return
        this._isAggregate = true;
        return this;
    }

    // HELPER FUNCTIONS
    private __addSort__(sort: 1 | -1, propertyName: string[]): void {
        // Iterate over all names and save them with sort number
        for (const name of propertyName) {
            if (typeof name !== "string") {
                throw new Error(`WeivData - propertyName doesn't contain valid value/s!`);
            } else {
                this._sort.set(name, sort);
            }
        }
    }
}

export class QueryResult extends Query {
    // Internal
    private _collection!: Collection;
    private _database!: Db;
    private _currentPage: number = 1;

    async count(options?: WeivDataOptions): Promise<number> {
        try {
            const { suppressAuth, suppressHooks, readConcern } = copyOwnPropsOnly(options || {});
            await this._handleConnection_(suppressAuth);

            const context = prepareHookContext(this._collectionId);
            let editedQurey: QueryResult | undefined;
            if (suppressHooks != true) {
                editedQurey = await runDataHook<'beforeCount'>(this._collectionId, "beforeCount", [this, context]).catch((err) => {
                    throw new Error(`beforeCount Hook Failure ${err}`);
                });
            }

            const totalCount = await this._collection.countDocuments(!editedQurey ? this._filters.$match : editedQurey._filters.$match, { readConcern });

            if (suppressHooks != true) {
                let editedCount = await runDataHook<'afterCount'>(this._collectionId, "afterCount", [totalCount, context]).catch((err) => {
                    throw new Error(`afterCount Hook Failure ${err}`);
                });

                if (editedCount) {
                    return editedCount;
                }
            }

            return totalCount;
        } catch (err) {
            throw new Error(`WeivData - Error when using count with weivData.query: ${err}`);
        }
    }

    async distnict(propertyName: string, options?: WeivDataOptions): Promise<WeivDataQueryResult> {
        try {
            if (!propertyName || typeof propertyName !== "string") {
                throw new Error(`WeivData - propertyName is not string or not a valid value!`);
            }

            // Clear prototype pollution
            options = copyOwnPropsOnly(options || {});

            const { suppressAuth, readConcern } = options;
            await this._handleConnection_(suppressAuth);

            // Create distnict aggregate pipeline with filters only
            const pipeline: PipelineStage[] = [];
            pipeline.push(this._filters);
            pipeline.push({ $group: { _id: `$${propertyName}` } });
            pipeline.push({ $project: { distnict: "$_id", _id: 0 } });

            const aggregationCursor = this._collection.aggregate(pipeline, { readConcern });

            // Get distnict values as an array of objects (and check for hasNext)
            const items = (await aggregationCursor.toArray()).map(i => i.distinct);
            const hasNext = await aggregationCursor.hasNext();
            // Get the exact or estimated total count of collection
            const totalCount = await this.__getTotalCount__(options?.omitTotalCount || false);

            return {
                items,
                length: items.length,
                currentPage: this._currentPage,
                pageSize: this._limitNumber,
                totalCount,
                totalPages: Math.ceil(totalCount / this._limitNumber),
                hasNext: () => hasNext,
                hasPrev: () => this.__hasPrev__(),
                next: async () => {
                    this._currentPage++;
                    return this.distnict(propertyName, options);
                },
                prev: async () => {
                    this._currentPage--;
                    return this.distnict(propertyName, options);
                },
                _filters: this._filters,
                _pipeline: pipeline
            }
        } catch (err) {
            throw new Error(`WeivData - Error when using distnict with weivData.query: ${err}`);
        }
    }

    async find(options?: WeivDataOptions): Promise<WeivDataQueryResult> {
        try {
            // Clear prototype pollution
            options = copyOwnPropsOnly(options || {});
            const { suppressAuth, suppressHooks, readConcern, omitTotalCount } = options;
            await this._handleConnection_(suppressAuth);

            const context = prepareHookContext(this._collectionId);

            if (suppressHooks != true) {
                await runDataHook<'beforeQuery'>(this._collectionId, "beforeQuery", [this, context]).catch((err) => {
                    throw new Error(`beforeQuery Hook Failure ${err}`);
                });
            }

            // Check if we need to run an aggregation or find is enough (both for performance and need)
            let totalCount: number;
            let items: Item[];
            let hasNext: boolean;

            if (this._isAggregate) {
                const pipeline = this.__createAggregationPipeline__();
                const aggregationCursor = this._collection.aggregate(pipeline, { readConcern });

                // Get Items and check if there are at least 1 more item with hasNext
                items = await aggregationCursor.toArray();
                hasNext = await aggregationCursor.hasNext();

                // Get the total count of the documents in the collection
                totalCount = await this.__getTotalCount__(omitTotalCount || false);
            } else {
                const findCursor = this._collection.find(this._filters.$match, { readConcern });

                // Add sorts into find cursor
                for (const [key, value] of this._sort.entries()) {
                    findCursor.sort(key, value);
                }

                // Add skip and limit numbers into find
                findCursor.limit(this._limitNumber);
                findCursor.skip(this._skipNumber || 0 + ((this._currentPage - 1) * this._limitNumber));

                // Get items and check if there are at least one more item in the next query
                items = await findCursor.toArray();
                hasNext = await findCursor.hasNext();

                // Get the total count of the documents in the collection
                totalCount = await this.__getTotalCount__(omitTotalCount || false);
            }

            // Handle afterQuery hook and pass items array with new data if exist
            if (suppressHooks != true) {
                const hookedItems = items.map(async (item, index) => {
                    const editedItem = await runDataHook<'afterQuery'>(this._collectionId, "afterQuery", [item, context]).catch((err) => {
                        throw new Error(`afterQuery Hook Failure ${err} Item Index: ${index}`);
                    });

                    if (editedItem) {
                        return editedItem;
                    } else {
                        return item;
                    }
                });

                items = await Promise.all(hookedItems);
            }

            return {
                items,
                length: items.length,
                currentPage: this._currentPage,
                pageSize: this._limitNumber,
                totalCount,
                totalPages: Math.ceil(totalCount / this._limitNumber),
                hasNext: () => hasNext,
                hasPrev: () => this.__hasPrev__(),
                next: async () => {
                    this._currentPage++;
                    return this.find(options);
                },
                prev: async () => {
                    this._currentPage--;
                    return this.find(options);
                },
                _filters: this._filters,
                _pipeline: this._isAggregate ? this.__createAggregationPipeline__() : undefined
            }
        } catch (err) {
            console.error('WeivData - Error pipeline: ', this.__createAggregationPipeline__());
            console.error('WeivData - Error query: ', this._filters);
            throw new Error(`WeivData - Error when using find with weivData.query, details: ${err}`);
        }
    }

    constructor(collectionId: CollectionID) {
        if (!collectionId || typeof collectionId !== "string") {
            throw new Error(`WeivData - CollectionID must be string and shouldn't be undefined or null!`);
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

    private __createAggregationPipeline__() {
        // Define pipeline
        const pipeline: PipelineStage[] = [];

        // Add filters to pipeline!
        if (!isEmpty(this._filters.$match)) {
            pipeline.push(this._filters);
        }

        // Add all includes (joins / lookups)
        for (const include of this._includes) {
            // Create lookup stage object with default sort
            const lookUpObj: PipelineStage = {
                $lookup: {
                    from: include.collectionName,
                    localField: include.fieldName,
                    foreignField: !include.foreignField ? "_id" : include.foreignField,
                    as: !include.as ? include.fieldName : include.as,
                    pipeline: [
                        // Limit max numbers of joins (defaults to 50)
                        { $limit: include.maxItems || 50 },
                        // Sort ascending by _createdDate
                        { $sort: this.__getSortFromInclude__(include) }
                    ]
                }
            }

            // Add another stage before lookup to return the actual total number of references
            if (include.countItems) {
                pipeline.push({
                    $addFields: {
                        [`${include.fieldName}Length`]: {
                            $cond: {
                                if: { $isArray: `$${include.fieldName}` },
                                then: { $size: `$${include.fieldName}` },
                                else: 0
                            }
                        }
                    }
                });
            }

            // Push lookup stage
            pipeline.push(lookUpObj);
        }

        // Add sorting options to aggregate
        for (const [key, value] of this._sort.entries()) {
            pipeline.push({
                $sort: {
                    [key]: value
                }
            });
        }

        // Add fields (project) into an object to handle everything in single stage
        let fields: { [key: string]: 1 } = {};
        for (const field of this._fields) {
            merge(fields, { [field]: 1 });
        }

        // Push included fields to pipeline with project
        if (!isEmpty(fields)) {
            pipeline.push({ $project: fields });
        }

        // Add skip and limit stages into pipeline
        pipeline.push({ $skip: this._skipNumber || 0 + ((this._currentPage - 1) * this._limitNumber) });
        pipeline.push({ $limit: this._limitNumber || 50 });

        return pipeline;
    }

    private __getSortFromInclude__(includeObj: IncludeObject) {
        if (includeObj.sort) {
            return copyOwnPropsOnly(includeObj.sort);
        } else {
            return { _createdDate: 1 };
        }
    }

    // // we won't use it more probably...
    // private __hasNext__(totalCount: number, items: Item[]): boolean {
    //     if (items.length > (this._limitNumber - 1)) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // Should return correct data in most cases!
    private __hasPrev__(): boolean {
        return this._currentPage > 1;
    }

    private async __getTotalCount__(omitTotalCount: boolean) {
        if (omitTotalCount) {
            return await this._collection.estimatedDocumentCount();
        } else {
            return await this._collection.countDocuments();
        }
    }
}