"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeivDataQuery = void 0;
const lodash_1 = require("lodash");
const automatic_connection_provider_1 = require("../Connection/automatic_connection_provider");
const data_query_result_1 = require("./data_query_result");
const name_helpers_1 = require("../Helpers/name_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
class WeivDataQuery {
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
    and(query) {
        this.filters = (0, lodash_1.merge)(query.filters, this.filters);
        return this;
    }
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
    not(query) {
        this.filters = {
            ...this.filters,
            $nor: [query.filters],
        };
        return this;
    }
    or(query) {
        this.filters = {
            ...this.filters,
            $or: [query.filters],
        };
        return this;
    }
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
    async count(options) {
        try {
            const { suppressAuth, consistentRead, suppressHooks } = options;
            const { collection } = await this.connectionHandler(suppressAuth);
            this.filtersHandler();
            const context = (0, hook_helpers_1.prepareHookContext)(this.collectionId);
            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await (0, hook_manager_1.runDataHook)(this.collectionId, "beforeCount", [this, context]).catch((err) => {
                    throw Error(`WeivData - beforeCount Hook Failure ${err}`);
                });
            }
            const countOptions = consistentRead === true ? { readConcern: 'majority' } : { readConcern: 'local' };
            let totalCount;
            if (editedQurey) {
                totalCount = await collection.countDocuments(editedQurey.query, (0, lodash_1.isEmpty)(editedQurey.query) ? { ...countOptions, hint: "_id_" } : countOptions);
            }
            else {
                totalCount = await collection.countDocuments(this.query, (0, lodash_1.isEmpty)(this.query) ? { ...countOptions, hint: "_id_" } : countOptions);
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
    async distinct(propertyName, options) {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        this.distinctValue = propertyName;
        return this.runQuery(options);
    }
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
    async find(options) {
        return this.runQuery(options);
    }
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
    limit(limit) {
        if (!limit && limit != 0) {
            throw Error(`WeivData - Limit number is required!`);
        }
        if (limit != 0) {
            this.limitNumber = limit;
        }
        return this;
    }
    skip(skip) {
        if (!skip && skip != 0) {
            throw Error(`WeivData - Skip number is required!`);
        }
        this.skipNumber = skip;
        return this;
    }
    async runQuery(options) {
        try {
            const { suppressAuth, suppressHooks, consistentRead } = options || {};
            const { collection } = await this.connectionHandler(suppressAuth);
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
    addFilter(newFilter) {
        this.filters = (0, lodash_1.merge)(this.filters, newFilter);
        return this.filters;
    }
    filtersHandler() {
        if ((0, lodash_1.size)(this.filters) > 0) {
            this.query = (0, lodash_1.merge)(this.query, this.filters);
        }
    }
    async connectionHandler(suppressAuth = false) {
        const { pool, memberId } = await (0, automatic_connection_provider_1.useClient)(suppressAuth);
        if (this.dbName) {
            this.db = pool.db(this.dbName);
        }
        else {
            this.db = pool.db("exweiv");
        }
        const collection = this.db.collection(this.collectionName);
        return { collection, memberId };
    }
}
exports.WeivDataQuery = WeivDataQuery;
