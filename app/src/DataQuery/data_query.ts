import { Db, CountOptions } from 'mongodb/mongodb';
import { DataQueryInterface } from '../Interfaces/interfaces';
import { DataQueryFilter } from './data_query_filters';
import { merge, size } from 'lodash';
import { useClient } from '../Connection/connection_provider';
import { WeivDataQueryResult } from './query_result';
import { splitCollectionId } from '../Helpers/name_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';

export class DataQuery extends DataQueryFilter implements DataQueryInterface {
    private collectionId: string;
    private collectionName: string;
    private dbName = "exweiv";
    private db!: Db;
    private query: QueryFilters = {};
    private sorting!: QuerySort;
    private queryFields!: QueryFields;
    private distinctValue!: string;
    private includeValues: { $lookup?: LookupObject, $unwind?: string }[] = [];
    private skipNumber!: number;
    private limitNumber = 50;
    private referenceLenght: ReferenceLenghtObject = {};

    constructor(collectionId: string) {
        super();
        if (!collectionId) {
            throw Error(`WeivData - Collection name required`);
        }

        this.collectionId = collectionId;
        this.setDataQuery(this);
        const { dbName, collectionName } = splitCollectionId(collectionId);

        this.collectionName = collectionName;
        this.dbName = dbName;
    }

    /**
     * @description Adds a sort to a query or sort, sorting by the specified properties in ascending order.
     * @param propertyName The properties used in the sort.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    ascending(...propertyName: string[]): DataQuery {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const name of propertyName) {
            this.sorting = merge(this.sorting, {
                [name]: 1
            })
        }

        return this;
    }

    /**
     * @description Returns the number of items that match the query.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The number of items that match the query. Rejected - The errors that caused the rejection.
     */
    async count(options: QueryOptions = {
        suppressAuth: false,
        consistentRead: false,
        cleanupAfter: false,
        suppressHooks: false
    }): Promise<number> {
        try {
            const { suppressAuth, consistentRead, cleanupAfter, suppressHooks } = options;
            const { collection, cleanup } = await this.connectionHandler(suppressAuth);

            // Add filters to query
            this.filtersHandler();

            let countOptions: CountOptions = {};
            if (consistentRead === true) {
                countOptions = merge(countOptions, { readConcern: 'majority' })
            }

            const context = prepareHookContext(this.collectionId);

            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await runDataHook<'beforeCount'>(this.collectionId, "beforeCount", [this, context]).catch((err) => {
                    throw Error(`WeivData - beforeCount Hook Failure ${err}`);
                });
            }

            let totalCount;
            if (editedQurey) {
                totalCount = await collection.countDocuments(editedQurey.query, countOptions);
            } else {
                totalCount = await collection.countDocuments(this.query, countOptions);
            }

            // Close the connection to space up the connection pool in MongoDB (if cleanupAfter === true)
            if (cleanupAfter === true) {
                await cleanup();
            }

            if (suppressHooks != true) {
                let editedCount = await runDataHook<'afterCount'>(this.collectionId, "afterCount", [totalCount, context]).catch((err) => {
                    throw Error(`WeivData - afterCount Hook Failure ${err}`);
                });

                if (editedCount) {
                    return editedCount;
                }
            }

            return totalCount;
        } catch (err) {
            throw Error(`WeivData - Error when using count with weivData.query: ${err}`);
        }
    }

    /**
     * @description Adds a sort to a query or sort, sorting by the specified properties in descending order.
     * @param propertyName The properties used in the sort.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    descending(...propertyName: string[]): DataQuery {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const name of propertyName) {
            this.sorting = merge(this.sorting, {
                [name]: -1
            })
        }

        return this;
    }

    async distinct(propertyName: string, options: QueryOptions = {
        suppressAuth: false,
        suppressHooks: false,
        cleanupAfter: false,
        consistentRead: false
    }): Promise<QueryResult> {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        this.distinctValue = propertyName;
        return this.runQuery(options);
    }

    /**
     * @description Lists the fields to return in a query's results.
     * @param propertyName Properties to return. To return multiple properties, pass properties as additional arguments.
     * @returns A `WeivDataQuery` object representing the query.
     */
    fields(...propertyName: string[]): DataQuery {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const name of propertyName) {
            this.queryFields = merge(this.queryFields, {
                [name]: 1
            })
        }

        return this;
    }

    async find(options: QueryOptions = {
        suppressAuth: false,
        suppressHooks: false,
        cleanupAfter: false,
        consistentRead: false
    }): Promise<QueryResult> {
        return this.runQuery(options);
    }

    /**
     * @description Includes referenced items for the specified properties in a query's results.
     * @param propertyName The properties for which to include referenced items.
     * @returns A `WeivDataQuery` object representing the query.
     */
    include(...propertyName: IncludeObject[]): DataQuery {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const { fieldName, collectionName, foreignField, as, maxItems, countItems } of propertyName) {
            if (countItems === true) {
                this.referenceLenght = merge(this.referenceLenght, {
                    [`${fieldName}Length`]: {
                        $cond: {
                            if: { $isArray: `$${fieldName}` },
                            then: { $size: `$${fieldName}` },
                            else: 0
                        }
                    }
                })
            }

            this.includeValues.push({
                $lookup: {
                    from: collectionName,
                    localField: fieldName,
                    foreignField: foreignField || "_id",
                    as: as || fieldName,
                    pipeline: [{ $limit: maxItems || 50 }]
                }
            })
        }

        return this;
    }

    /**
     * @description Limits the number of items the query returns.
     * @param limit The number of items to return, which is also the `pageSize` of the results object.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    limit(limit: number): DataQuery {
        if (!limit && limit != 0) {
            throw Error(`WeivData - Limit number is required!`);
        }

        if (limit != 0) {
            this.limitNumber = limit;
        }

        return this;
    }

    /**
     * @description Sets the number of items to skip before returning query results.
     * @param skip The number of items to skip in the query results before returning the results.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    skip(skip: number): DataQuery {
        if (!skip && skip != 0) {
            throw Error(`WeivData - Skip number is required!`);
        }
        this.skipNumber = skip;
        return this;
    }

    // HELPER FUNCTIONS IN CLASS
    private async runQuery(options: QueryOptions): Promise<QueryResult> {
        try {
            const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options;
            const { cleanup, collection } = await this.connectionHandler(suppressAuth);

            const context = prepareHookContext(this.collectionId);

            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await runDataHook<'beforeQuery'>(this.collectionId, "beforeQuery", [this, context]).catch((err) => {
                    throw Error(`WeivData - beforeQuery Hook Failure ${err}`);
                });
            }

            let classInUse = !editedQurey ? this : editedQurey;

            const query = {
                filters: classInUse.filters,
                dbName: classInUse.dbName,
                includeValues: classInUse.includeValues,
                limit: classInUse.limitNumber,
                collectionName: classInUse.collectionName
            }

            // Add filters to query
            classInUse.filtersHandler();
            const result = await WeivDataQueryResult({
                suppressAuth,
                suppressHooks,
                consistentRead,
                collection,
                pageSize: classInUse.limitNumber,
                dbName: classInUse.dbName,
                collectionName: classInUse.collectionName,
                queryClass: query,
                queryOptions: {
                    query: classInUse.query,
                    distinctProperty: classInUse.distinctValue,
                    skip: classInUse.skipNumber,
                    sort: classInUse.sorting,
                    fields: classInUse.queryFields,
                    includes: classInUse.includeValues,
                    addFields: classInUse.referenceLenght
                }
            }).getResult();

            if (cleanupAfter === true) {
                await cleanup();
            }

            if (suppressHooks != true) {
                const hookedItems = await result.items.map(async (item, index) => {
                    const editedItem = await runDataHook<'afterQuery'>(classInUse.collectionId, "afterQuery", [item, context]).catch((err) => {
                        console.error(`WeivData - afterQuery Hook Failure ${err} Item Index: ${index}`);
                    });

                    if (editedItem) {
                        return editedItem;
                    } else {
                        return item;
                    }
                })

                const fulfilledItems = await Promise.all(hookedItems);
                return {
                    ...result,
                    items: fulfilledItems
                };
            }

            return result;
        } catch (err) {
            throw Error(`WeivData - Error when using query (runQuery): ${err}`);
        }
    }

    private filtersHandler(): void {
        // Check if there is any filters
        if (size(this.filters) > 0) {
            this.query = merge(this.query, this.filters)
        }
    }

    private async connectionHandler(suppressAuth = false): Promise<ConnectionResult> {
        const { pool, cleanup, memberId } = await useClient(suppressAuth);

        if (this.dbName) {
            this.db = pool.db(this.dbName);
        } else {
            this.db = pool.db("exweiv");
        }

        const collection = this.db.collection(this.collectionName);
        return { collection, cleanup, memberId };
    }
}

export function ExWeivDataQuery(dynamicName: string) {
    try {
        return new DataQuery(dynamicName);
    } catch (err) {
        throw Error(`WeivData - Error when returning query class: ${err}`);
    }
}