"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeivDataQuery = void 0;
const lodash_1 = require("lodash");
const connection_provider_1 = require("../Connection/connection_provider");
const data_query_result_1 = require("./data_query_result");
const name_helpers_1 = require("../Helpers/name_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
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
class WeivDataQuery {
    /** @internal */
    constructor(collectionId) {
        this.dbName = "exweiv";
        this.query = {};
        this.includeValues = [];
        this.limitNumber = 50;
        this.referenceLenght = {};
        this.filters = {};
        if (!collectionId) {
            throw Error(`WeivData - Collection name required`);
        }
        this.collectionId = collectionId;
        const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
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
    and(query) {
        this.filters = (0, lodash_1.merge)(query.filters, this.filters);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value is within a specified range.
     *
     * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
     * @param rangeStart The beginning value of the range to match against.
     * @param rangeEnd The ending value of the range to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    between(propertyName, rangeStart, rangeEnd) {
        if (!this.memoizedBetween) {
            this.memoizedBetween = (0, lodash_1.memoize)((propertyName, rangeStart, rangeEnd) => {
                return this.addFilter({
                    [propertyName]: {
                        $gte: rangeStart,
                        $lte: rangeEnd,
                    },
                });
            });
        }
        this.memoizedBetween(propertyName, rangeStart, rangeEnd);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value contains a specified string.
     *
     * @param propertyName
     * @param string
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    contains(propertyName, string) {
        if (!this.memoizedContains) {
            this.memoizedContains = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: string,
                        $options: "i",
                    },
                });
            });
        }
        this.memoizedContains(propertyName, string);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value ends with a specified string.
     *
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the end of the specified property value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    endsWith(propertyName, string) {
        if (!this.memoizedEndsWith) {
            this.memoizedEndsWith = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: `${string}$`,
                        $options: "i",
                    },
                });
            });
        }
        this.memoizedEndsWith(propertyName, string);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value equals the specified value.
     *
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    eq(propertyName, value) {
        if (!this.memoizedEq) {
            this.memoizedEq = (0, lodash_1.memoize)((propertyName, value) => {
                if (propertyName === "_id") {
                    return this.addFilter({
                        [propertyName]: (0, item_helpers_1.convertStringId)(value),
                    });
                }
                return this.addFilter({
                    [propertyName]: value,
                });
            });
        }
        this.memoizedEq(propertyName, value);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
     *
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    ge(propertyName, value) {
        if (!this.memoizedGe) {
            this.memoizedGe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $gte: value,
                    },
                });
            });
        }
        this.memoizedGe(propertyName, value);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value is greater than the specified value.
     *
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    gt(propertyName, value) {
        if (!this.memoizedGt) {
            this.memoizedGt = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $gt: value,
                    },
                });
            });
        }
        this.memoizedGt(propertyName, value);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property values equals all of the specified `value` parameters.
     *
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    hasAll(propertyName, value) {
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!this.memoizedHasAll) {
            this.memoizedHasAll = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $all: value,
                    },
                });
            });
        }
        this.memoizedHasAll(propertyName, value);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
     *
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    hasSome(propertyName, value) {
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!this.memoizedHasSome) {
            this.memoizedHasSome = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $in: value,
                    },
                });
            });
        }
        this.memoizedHasSome(propertyName, value);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property does not exist or does not have any value.
     *
     * @param propertyName The the property in which to check for a value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    isEmpty(propertyName) {
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter({
                    [propertyName]: {
                        $exists: false,
                    },
                });
            });
        }
        this.memoizedIsEmpty(propertyName);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property has any value.
     *
     * @param propertyName The property in which to check for a value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    isNotEmpty(propertyName) {
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter({
                    [propertyName]: {
                        $exists: true,
                    },
                });
            });
        }
        this.memoizedIsNotEmpty(propertyName);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
     *
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    le(propertyName, value) {
        if (!this.memoizedLe) {
            this.memoizedLe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $lte: value,
                    },
                });
            });
        }
        this.memoizedLe(propertyName, value);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value is less than the specified value.
     *
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    lt(propertyName, value) {
        if (!this.memoizedLt) {
            this.memoizedLt = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $lt: value,
                    },
                });
            });
        }
        this.memoizedLt(propertyName, value);
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value does not equal the specified value.
     *
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    ne(propertyName, value) {
        if (!this.memoizedNe) {
            this.memoizedNe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $ne: value,
                    },
                });
            });
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
    not(query) {
        this.filters = {
            ...this.filters,
            $nor: [query.filters],
        };
        return this;
    }
    /**
     * Adds an `or` condition to the query or filter.
     *
     * @param query A query to add to the initial query as an `or` condition.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    or(query) {
        this.filters = {
            ...this.filters,
            $or: [query.filters],
        };
        return this;
    }
    /**
     * Refines a query or filter to match items whose specified property value starts with a specified string.
     *
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the beginning of the specified property value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    startsWith(propertyName, string) {
        if (!this.memoizedStartsWith) {
            this.memoizedStartsWith = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: `^${string}`,
                        $options: "i",
                    },
                });
            });
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
    ascending(...propertyName) {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        for (const name of propertyName) {
            this.sorting = (0, lodash_1.merge)(this.sorting, {
                [name]: 1
            });
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
    async count(options) {
        try {
            const { suppressAuth, consistentRead, cleanupAfter, suppressHooks } = options;
            const { collection, cleanup } = await this.connectionHandler(suppressAuth);
            // Add filters to query
            this.filtersHandler();
            let countOptions = {};
            if (consistentRead === true) {
                countOptions = (0, lodash_1.merge)(countOptions, { readConcern: 'majority' });
            }
            const context = (0, hook_helpers_1.prepareHookContext)(this.collectionId);
            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await (0, hook_manager_1.runDataHook)(this.collectionId, "beforeCount", [this, context]).catch((err) => {
                    throw Error(`WeivData - beforeCount Hook Failure ${err}`);
                });
            }
            let totalCount;
            if (editedQurey) {
                totalCount = await collection.countDocuments(editedQurey.query, countOptions);
            }
            else {
                totalCount = await collection.countDocuments(this.query, countOptions);
            }
            // Close the connection to space up the connection pool in MongoDB (if cleanupAfter === true)
            if (cleanupAfter === true) {
                await cleanup();
            }
            if (suppressHooks != true) {
                let editedCount = await (0, hook_manager_1.runDataHook)(this.collectionId, "afterCount", [totalCount, context]).catch((err) => {
                    throw Error(`WeivData - afterCount Hook Failure ${err}`);
                });
                if (editedCount) {
                    return editedCount;
                }
            }
            return totalCount;
        }
        catch (err) {
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
    descending(...propertyName) {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        for (const name of propertyName) {
            this.sorting = (0, lodash_1.merge)(this.sorting, {
                [name]: -1
            });
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
    async distinct(propertyName, options) {
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
    fields(...propertyName) {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        for (const name of propertyName) {
            this.queryFields = (0, lodash_1.merge)(this.queryFields, {
                [name]: 1
            });
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
    async find(options) {
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
    include(...includes) {
        if (!includes) {
            throw Error(`WeivData - Property name required!`);
        }
        for (const { fieldName, collectionName, foreignField, as, maxItems, countItems } of includes) {
            if (countItems === true) {
                this.referenceLenght = (0, lodash_1.merge)(this.referenceLenght, {
                    [`${fieldName}Length`]: {
                        $cond: {
                            if: { $isArray: `$${fieldName}` },
                            then: { $size: `$${fieldName}` },
                            else: 0
                        }
                    }
                });
            }
            this.includeValues.push({
                $lookup: {
                    from: collectionName,
                    localField: fieldName,
                    foreignField: foreignField || "_id",
                    as: as || fieldName,
                    pipeline: [{ $limit: maxItems || 50 }]
                }
            });
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
    limit(limit) {
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
    skip(skip) {
        if (!skip && skip != 0) {
            throw Error(`WeivData - Skip number is required!`);
        }
        this.skipNumber = skip;
        return this;
    }
    // HELPER FUNCTIONS IN CLASS
    /** @internal */
    async runQuery(options) {
        try {
            const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};
            const { cleanup, collection } = await this.connectionHandler(suppressAuth);
            const context = (0, hook_helpers_1.prepareHookContext)(this.collectionId);
            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await (0, hook_manager_1.runDataHook)(this.collectionId, "beforeQuery", [this, context]).catch((err) => {
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
            };
            // Add filters to query
            classInUse.filtersHandler();
            const result = await new data_query_result_1.InternalWeivDataQueryResult({
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
            if (cleanupAfter === true) {
                await cleanup();
            }
            if (suppressHooks != true) {
                const hookedItems = await result.items.map(async (item, index) => {
                    const editedItem = await (0, hook_manager_1.runDataHook)(classInUse.collectionId, "afterQuery", [item, context]).catch((err) => {
                        console.error(`WeivData - afterQuery Hook Failure ${err} Item Index: ${index}`);
                    });
                    if (editedItem) {
                        return editedItem;
                    }
                    else {
                        return item;
                    }
                });
                const fulfilledItems = await Promise.all(hookedItems);
                return {
                    ...result,
                    items: fulfilledItems
                };
            }
            return result;
        }
        catch (err) {
            throw Error(`WeivData - Error when using query (runQuery): ${err}`);
        }
    }
    /**@internal */
    addFilter(newFilter) {
        this.filters = (0, lodash_1.merge)(this.filters, newFilter);
        return this.filters;
    }
    /** @internal */
    filtersHandler() {
        // Check if there is any filters
        if ((0, lodash_1.size)(this.filters) > 0) {
            this.query = (0, lodash_1.merge)(this.query, this.filters);
        }
    }
    /** @internal */
    async connectionHandler(suppressAuth = false) {
        const { pool, cleanup, memberId } = await (0, connection_provider_1.useClient)(suppressAuth);
        if (this.dbName) {
            this.db = pool.db(this.dbName);
        }
        else {
            this.db = pool.db("exweiv");
        }
        const collection = this.db.collection(this.collectionName);
        return { collection, cleanup, memberId };
    }
}
exports.WeivDataQuery = WeivDataQuery;
