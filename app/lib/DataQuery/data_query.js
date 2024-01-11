"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExWeivDataQuery = exports.DataQuery = void 0;
const data_query_filters_1 = require("./data_query_filters");
const log_handlers_1 = require("../Log/log_handlers");
const lodash_1 = require("lodash");
const connection_provider_1 = require("../Connection/connection_provider");
const query_result_1 = require("./query_result");
const name_helpers_1 = require("../Helpers/name_helpers");
class DataQuery extends data_query_filters_1.DataQueryFilter {
    collectionName;
    dbName = "exweiv";
    db;
    query = {};
    sorting;
    queryFields;
    distinctValue;
    includeValues = [];
    skipNumber;
    limitNumber = 50;
    referenceLenght = {};
    constructor(collectionId) {
        super();
        if (!collectionId) {
            (0, log_handlers_1.reportError)("Collection name required");
        }
        this.setDataQuery(this);
        const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        this.collectionName = collectionName;
        this.dbName = dbName;
    }
    ascending(...propertyName) {
        if (!propertyName) {
            (0, log_handlers_1.reportError)("Property name required!");
        }
        for (const name of propertyName) {
            this.sorting = (0, lodash_1.merge)(this.sorting, {
                [name]: 1
            });
        }
        return this;
    }
    async count(options = {
        suppressAuth: false,
        consistentRead: false,
        cleanupAfter: false,
        suppressHooks: false
    }) {
        const { suppressAuth, consistentRead, cleanupAfter } = options;
        const { collection, memberId, cleanup } = await this.connectionHandler(suppressAuth);
        if (memberId && suppressAuth != true) {
            this.eq("_owner", memberId);
        }
        this.filtersHandler();
        let countOptions = {};
        if (consistentRead === true) {
            countOptions = (0, lodash_1.merge)(countOptions, { readConcern: 'majority' });
        }
        const totalCount = await collection.countDocuments(this.query, countOptions);
        if (cleanupAfter === true) {
            await cleanup();
        }
        return totalCount;
    }
    descending(...propertyName) {
        if (!propertyName) {
            (0, log_handlers_1.reportError)("Property name required!");
        }
        for (const name of propertyName) {
            this.sorting = (0, lodash_1.merge)(this.sorting, {
                [name]: -1
            });
        }
        return this;
    }
    async distinct(propertyName, options = {
        suppressAuth: false,
        suppressHooks: false,
        cleanupAfter: false,
        consistentRead: false
    }) {
        if (!propertyName) {
            (0, log_handlers_1.reportError)("Property name required!");
        }
        this.distinctValue = propertyName;
        return this.runQuery(options);
    }
    fields(...propertyName) {
        if (!propertyName) {
            (0, log_handlers_1.reportError)("Property name required!");
        }
        for (const name of propertyName) {
            this.queryFields = (0, lodash_1.merge)(this.queryFields, {
                [name]: 1
            });
        }
        return this;
    }
    async find(options = {
        suppressAuth: false,
        suppressHooks: false,
        cleanupAfter: false,
        consistentRead: false
    }) {
        return this.runQuery(options);
    }
    include(...propertyName) {
        if (!propertyName) {
            (0, log_handlers_1.reportError)("Property name required!");
        }
        for (const { fieldName, collectionName, foreignField, as, type = "mixed", maxItems, countItems } of propertyName) {
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
            if (type === "single") {
                this.includeValues.push({
                    $unwind: `$${fieldName}`
                });
            }
        }
        return this;
    }
    limit(limit) {
        if (!limit && limit != 0) {
            (0, log_handlers_1.reportError)("Limit number is required!");
        }
        if (limit != 0) {
            this.limitNumber = limit;
        }
        return this;
    }
    skip(skip) {
        if (!skip && skip != 0) {
            (0, log_handlers_1.reportError)("Skip number is required!");
        }
        this.skipNumber = skip;
        return this;
    }
    async runQuery(options) {
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options;
        const { cleanup, memberId, collection } = await this.connectionHandler(suppressAuth);
        if (memberId && suppressAuth != true) {
            this.eq("_owner", memberId);
        }
        this.filtersHandler();
        const result = await (0, query_result_1.WeivDataQueryResult)({
            suppressAuth,
            suppressHooks,
            consistentRead,
            collection,
            pageSize: this.limitNumber,
            dbName: this.dbName,
            collectionName: this.collectionName,
            queryClass: this,
            queryOptions: {
                query: this.query,
                distinctProperty: this.distinctValue,
                skip: this.skipNumber,
                sort: this.sorting,
                fields: this.queryFields,
                includes: this.includeValues,
                addFields: this.referenceLenght
            }
        }).getResult();
        if (cleanupAfter === true) {
            await cleanup();
        }
        return result;
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
exports.DataQuery = DataQuery;
function ExWeivDataQuery(dynamicName) {
    return new DataQuery(dynamicName);
}
exports.ExWeivDataQuery = ExWeivDataQuery;
