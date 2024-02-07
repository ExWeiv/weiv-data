"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeivDataQuery = void 0;
const data_query_filters_1 = require("./data_query_filters");
const lodash_1 = require("lodash");
const connection_provider_1 = require("../Connection/connection_provider");
const query_result_1 = require("./query_result");
const name_helpers_1 = require("../Helpers/name_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
class WeivDataQuery extends data_query_filters_1.WeivDataQueryFilter {
    constructor(collectionId) {
        super();
        this.dbName = "exweiv";
        this.query = {};
        this.includeValues = [];
        this.limitNumber = 50;
        this.referenceLenght = {};
        if (!collectionId) {
            throw Error(`WeivData - Collection name required`);
        }
        this.collectionId = collectionId;
        this.setDataQuery(this);
        const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        this.collectionName = collectionName;
        this.dbName = dbName;
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
            const { suppressAuth, consistentRead, cleanupAfter, suppressHooks } = options;
            const { collection, cleanup } = await this.connectionHandler(suppressAuth);
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
    include(...propertyName) {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        for (const { fieldName, collectionName, foreignField, as, maxItems, countItems } of propertyName) {
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
            classInUse.filtersHandler();
            const result = await new query_result_1.WeivDataQueryResult({
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
    filtersHandler() {
        if ((0, lodash_1.size)(this.filters) > 0) {
            this.query = (0, lodash_1.merge)(this.query, this.filters);
        }
    }
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
