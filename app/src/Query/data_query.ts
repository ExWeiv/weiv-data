import { Db, CountDocumentsOptions } from 'mongodb/mongodb';
import { merge, size, memoize, isEmpty } from 'lodash';
import { useClient } from '../Connection/automatic_connection_provider';
import { InternalWeivDataQueryResult, type WeivDataQueryResult } from './data_query_result';
import { splitCollectionId } from '../Helpers/name_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { ConnectionHandlerResult, WeivDataOptions, WeivDataOptionsCache } from '../Helpers/collection';

/**@public */
export interface IncludeObject {
    /**
     * Collection of referenced item/s (only collection name)
     */
    collectionName: string,

    /**
     * Property/field name of referenced items in the current item.
     */
    fieldName: string,

    /**
     * Foreign field name. Defaults to _id.
     */
    foreignField?: string,

    /**
     * Custom return name for included items. Defaults to `fieldName`.
     */
    as?: string

    /**
     * Maximum number of items to include. Defaults to 50.
     */
    maxItems?: number,

    /**
     * Enable counting total items or not. Defaults to `false`.
     */
    countItems?: boolean
}

/** @internal */
export type LookupObject = {
    from: string,
    localField: string,
    foreignField: string,
    as: string,
    pipeline: { $limit: number }[]
}

/** @internal */
export type ReferenceLenghtObject = {
    [key: string]: {
        $cond: {
            if: { $isArray: string },
            then: { $size: string },
            else: 0
        }
    }
}

/**
 * Welcome to `weivData.query` function of weiv-data library. This feature/function allows you to run queries on your database collections data.
 * You can use features such as sort and filter. And you can control the query.
 * Read documentation and learn more about weivData.query.
 * 
 * Features we are working for this function:
 * 
 * * **AI** (AI based auto generated queries for the operation you need)
 * * **Language** (Auto language filtering)
 * * **More!**
 * 
 * @public
 */
export class WeivDataQuery {
    private collectionId: string;
    private collectionName: string;
    private dbName = "exweiv";
    private db!: Db;
    private query: { [key: string]: object | string | number } = {};
    private sorting!: { [key: string]: 1 | -1; };
    private queryFields!: { [key: string]: 1 };
    private distinctValue!: string;
    private includeValues: { $lookup?: LookupObject, $unwind?: string }[] = [];
    private skipNumber!: number;
    private limitNumber = 50;
    private referenceLenght: ReferenceLenghtObject = {};
    private filters: { [key: string]: any } = {};

    /** @internal */
    constructor(collectionId: string) {
        if (!collectionId) {
            throw Error(`WeivData - Collection name required`);
        }

        this.collectionId = collectionId;
        const { dbName, collectionName } = splitCollectionId(collectionId);

        this.collectionName = collectionName;
        this.dbName = dbName;
    }

    // Filters
    /**
     * Adds an `and` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as an `and` condition.
     * @return {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    and(query: WeivDataQuery): WeivDataQuery {
        if (!this.filters["$and"]) {
            this.filters["$and"] = [];
        }
        this.filters["$and"].push(query.filters);

        return this;
    }

    private memoizedBetween!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is within a specified range.
     * 
     * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
     * @param rangeStart The beginning value of the range to match against.
     * @param rangeEnd The ending value of the range to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    between(propertyName: string, rangeStart: any, rangeEnd: any): WeivDataQuery {
        if (!this.memoizedBetween) {
            this.memoizedBetween = memoize((propertyName, rangeStart, rangeEnd) => {
                return this.addFilter(propertyName, {
                    $gte: rangeStart,
                    $lte: rangeEnd,
                });
            })
        }

        this.memoizedBetween(propertyName, rangeStart, rangeEnd);
        return this;
    }

    private memoizedContains!: Function;
    /**
     * Refines a query or filter to match items whose specified property value contains a specified string.
     * 
     * @param propertyName 
     * @param string 
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    contains(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedContains) {
            this.memoizedContains = memoize((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: string,
                    $options: "i",
                });
            })
        }

        this.memoizedContains(propertyName, string);
        return this;
    }

    private memoizedEndsWith!: Function;
    /**
     * Refines a query or filter to match items whose specified property value ends with a specified string.
     * 
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the end of the specified property value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    endsWith(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedEndsWith) {
            this.memoizedEndsWith = memoize((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: `${string}$`,
                    $options: "i",
                });
            })
        }

        this.memoizedEndsWith(propertyName, string);
        return this;
    }

    private memoizedEq!: Function;
    /**
     * Refines a query or filter to match items whose specified property value equals the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    eq(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedEq) {
            this.memoizedEq = memoize((propertyName, value) => {
                if (propertyName === "_id") {
                    return this.addFilter(propertyName, {
                        $eq: convertStringId(value),
                    });
                }

                return this.addFilter(propertyName, {
                    $eq: value,
                });
            })
        }

        this.memoizedEq(propertyName, value);
        return this;
    }

    private memoizedGe!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    ge(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedGe) {
            this.memoizedGe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $gte: value, });
            })
        }

        this.memoizedGe(propertyName, value);
        return this;
    }

    private memoizedGt!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is greater than the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    gt(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedGt) {
            this.memoizedGt = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $gt: value, });
            })
        }

        this.memoizedGt(propertyName, value);
        return this;
    }

    private memoizedHasAll!: Function;
    /**
     * Refines a query or filter to match items whose specified property values equals all of the specified `value` parameters.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    hasAll(propertyName: string, value: any): WeivDataQuery {
        if (!Array.isArray(value)) {
            value = [value];
        }

        if (!this.memoizedHasAll) {
            this.memoizedHasAll = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $all: value, });
            })
        }

        this.memoizedHasAll(propertyName, value);
        return this;
    }

    private memoizedHasSome!: Function;
    /**
     * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    hasSome(propertyName: string, value: any): WeivDataQuery {
        if (!Array.isArray(value)) {
            value = [value];
        }

        if (!this.memoizedHasSome) {
            this.memoizedHasSome = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $in: value, });
            })
        }

        this.memoizedHasSome(propertyName, value);
        return this;
    }

    private memoizedIsEmpty!: Function;
    /**
     * Refines a query or filter to match items whose specified property does not exist or does not have any value.
     * 
     * @param propertyName The the property in which to check for a value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    isEmpty(propertyName: string): WeivDataQuery {
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = memoize((propertyName) => {
                return this.addFilter(propertyName, { $exists: false, });
            })
        }

        this.memoizedIsEmpty(propertyName);
        return this;
    }

    private memoizedIsNotEmpty!: Function;
    /**
     * Refines a query or filter to match items whose specified property has any value.
     * 
     * @param propertyName The property in which to check for a value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    isNotEmpty(propertyName: string): WeivDataQuery {
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = memoize((propertyName) => {
                return this.addFilter(propertyName, { $exists: true, });
            })
        }

        this.memoizedIsNotEmpty(propertyName);
        return this;
    }

    private memoizedLe!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    le(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedLe) {
            this.memoizedLe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $lte: value, });
            })
        }

        this.memoizedLe(propertyName, value);
        return this;
    }

    private memoizedLt!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is less than the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    lt(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedLt) {
            this.memoizedLt = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $lt: value, });
            })
        }

        this.memoizedLt(propertyName, value);
        return this;
    }

    private memoizedNe!: Function;
    /**
     * Refines a query or filter to match items whose specified property value does not equal the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    ne(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedNe) {
            this.memoizedNe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $ne: value, });
            })
        }

        this.memoizedNe(propertyName, value);
        return this;
    }

    /**
     * Adds a `not` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as a `not` condition.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    not(query: WeivDataQuery): WeivDataQuery {
        if (!this.filters["$nor"]) {
            this.filters["$nor"] = [];
        }
        this.filters["$nor"].push(query.filters);

        return this;
    }

    /**
     * Adds an `or` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as an `or` condition.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    or(query: WeivDataQuery): WeivDataQuery {
        if (!this.filters["$or"]) {
            this.filters["$or"] = [];
        }
        this.filters["$or"].push(query.filters);

        return this;
    }

    private memoizedStartsWith!: Function;
    /**
     * Refines a query or filter to match items whose specified property value starts with a specified string.
     * 
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the beginning of the specified property value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    startsWith(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedStartsWith) {
            this.memoizedStartsWith = memoize((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: `^${string}`,
                    $options: "i",
                });
            })
        }

        this.memoizedStartsWith(propertyName, string);
        return this;
    }
    // End of Filters

    /**
     * Adds a sort to a query or sort, sorting by the specified properties in ascending order.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const queryResult = await weivData.query("Clusters/IST12").hasSome("availableCPUs", ["M1", "S1", "A2"]).ascending("clusterType").find();
     * console.log(queryResult);
     * ```
     * 
     * @param propertyName The properties used in the sort.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    ascending(...propertyName: string[]): WeivDataQuery {
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
    * Returns the number of items that match the query.
    * 
    * @example
    * ```js
    * import weivData from '@exweiv/weiv-data';
    * 
    * const queryResult = await weivData.query("Clusters/IST12").hasSome("availableCPUs", ["M1", "S1", "A2"]).count();
    * console.log(queryResult);
    * ```
    * 
    * @param options An object containing options to use when processing this operation.
    * @returns {Promise<number>} Fulfilled - The number of items that match the query. Rejected - The errors that caused the rejection.
    */
    async count(options: WeivDataOptions): Promise<number> {
        try {
            const { suppressAuth, consistentRead, suppressHooks } = options;
            const { collection } = await this.connectionHandler(suppressAuth);

            // Add filters to query
            this.filtersHandler();
            const context = prepareHookContext(this.collectionId);

            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await runDataHook<'beforeCount'>(this.collectionId, "beforeCount", [this, context]).catch((err) => {
                    throw Error(`WeivData - beforeCount Hook Failure ${err}`);
                });
            }

            const countOptions: CountDocumentsOptions = consistentRead === true ? { readConcern: 'majority' } : { readConcern: 'local' };

            let totalCount;
            if (editedQurey) {
                totalCount = await collection.countDocuments(editedQurey.query, isEmpty(editedQurey.query) ? { ...countOptions, hint: "_id_" } : countOptions);
            } else {
                totalCount = await collection.countDocuments(this.query, isEmpty(this.query) ? { ...countOptions, hint: "_id_" } : countOptions);
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
    * Adds a sort to a query or sort, sorting by the specified properties in descending order.
    * 
    * @example
    * ```js
    * import weivData from '@exweiv/weiv-data';
    * 
    * const queryResult = await weivData.query("Clusters/IST12").hasSome("availableCPUs", ["M1", "S1", "A2"]).descending("clusterType").find();
    * console.log(queryResult);
    * ```
    * 
    * @param propertyName The properties used in the sort.
    * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
    */
    descending(...propertyName: string[]): WeivDataQuery {
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

    /**
     * Returns the distinct values that match the query, without duplicates.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const queryResult = await weivData.query("Clusters/IST12").hasSome("availableCPUs", ["M1", "S1", "A2"]).distinct("clusterType");
     * console.log(queryResult);
     * ```
     * 
     * @param propertyName The property whose value will be compared for distinct values.
     * @param options An object containing options to use when processing this operation.
     * @returns {Promise<WeivDataQueryResult>} A `WeivDataQuery` object representing the refined query.
     */
    async distinct(propertyName: string, options: WeivDataOptions): Promise<WeivDataQueryResult> {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        this.distinctValue = propertyName;
        return this.runQuery(options);
    }

    /**
     * Lists the fields to return in a query's results.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const queryResult = await weivData.query("Clusters/IST12").hasSome("availableCPUs", ["M1", "S1", "A2"]).fields("clusterType", "balance", "_updatedDate").find({suppressHooks: true});
     * console.log(queryResult);
     * ```
     * 
     * @param propertyName Properties to return. To return multiple properties, pass properties as additional arguments.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    fields(...propertyName: string[]): WeivDataQuery {
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

    /**
     * Returns the items that match the query.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const queryResult = await weivData.query("Clusters/IST12")
     *  .hasSome("availableCPUs", ["M1", "S1", "A2"])
     *  .fields("clusterType", "balance", "_updatedDate")
     *  .find({suppressHooks: true, consistentRead: true});
     * 
     * console.log(queryResult);
     * ```
     * 
     * @param options An object containing options to use when processing this operation.
     * @returns {Promise<WeivDataQueryResult>} Fulfilled - A Promise that resolves to the results of the query. Rejected - Error that caused the query to fail.
     */
    async find(options: WeivDataOptions): Promise<WeivDataQueryResult> {
        return this.runQuery(options);
    }

    /**
     * Includes referenced items for the specified properties in a query's results.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const queryResult = await weivData.query("Clusters/IST12")
     *  .eq("memberTier", 1)
     *  .include("members", "CPUs")
     *  .hasSome("availableCPUs", ["M1", "S1", "A2"])
     *  .find({suppressHooks: true, consistentRead: true});
     * 
     * console.log(queryResult);
     * ```
     * 
     * @param includes Array of objects that you want to include with details
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    include(...includes: IncludeObject[]): WeivDataQuery {
        if (!includes) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const { fieldName, collectionName, foreignField, as, maxItems, countItems } of includes) {
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
     * Limits the number of items the query returns.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const queryResult = await weivData.query("Clusters/IST12")
     *  .eq("memberTier", 1)
     *  .include("members", "CPUs")
     *  .hasSome("availableCPUs", ["M1", "S1", "A2"])
     *  .limit(20)
     *  .find();
     * 
     * console.log(queryResult);
     * ```
     * 
     * @param limit The number of items to return, which is also the `pageSize` of the results object.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    limit(limit: number): WeivDataQuery {
        if (!limit && limit != 0) {
            throw Error(`WeivData - Limit number is required!`);
        }

        if (limit != 0) {
            this.limitNumber = limit;
        }

        return this;
    }

    /**
     * Sets the number of items to skip before returning query results.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const queryResult = await weivData.query("Clusters/IST12")
     *  .eq("memberTier", 1)
     *  .include("members", "CPUs")
     *  .hasSome("availableCPUs", ["M1", "S1", "A2"])
     *  .skip(20)
     *  .limit(200)
     *  .find();
     * 
     * console.log(queryResult);
     * ```
     * 
     * @param skip The number of items to skip in the query results before returning the results.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    skip(skip: number): WeivDataQuery {
        if (!skip && skip != 0) {
            throw Error(`WeivData - Skip number is required!`);
        }
        this.skipNumber = skip;
        return this;
    }

    // HELPER FUNCTIONS IN CLASS
    /** @internal */
    private async runQuery(options?: WeivDataOptionsCache): Promise<WeivDataQueryResult> {
        try {
            const { suppressAuth, suppressHooks, consistentRead, enableCache, cacheTimeout } = options || {};
            const { collection } = await this.connectionHandler(suppressAuth);

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
            const result = await new InternalWeivDataQueryResult({
                enableCache: enableCache || false,
                cacheTimeout: cacheTimeout || 15,
                suppressAuth,
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

    /**@internal */
    private addFilter(propertyName: string, newFilter: { [key: string]: any }) {
        this.filters[propertyName] = {
            ...this.filters[propertyName],
            ...newFilter
        }
        return this.filters;
    }

    /** @internal */
    private filtersHandler(): void {
        // Check if there is any filters
        if (size(this.filters) > 0) {
            this.query = merge(this.query, this.filters)
        }
    }

    /** @internal */
    private async connectionHandler(suppressAuth = false): Promise<ConnectionHandlerResult> {
        const { pool, memberId } = await useClient(suppressAuth);

        if (this.dbName) {
            this.db = pool.db(this.dbName);
        } else {
            this.db = pool.db("ExWeiv");
        }

        const collection = this.db.collection(this.collectionName);
        return { collection, memberId };
    }
}