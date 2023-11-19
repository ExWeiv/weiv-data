"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeivDataQueryResult = void 0;
const connection_provider_1 = require("../Connection/connection_provider");
const log_handlers_1 = require("../Log/log_handlers");
const lodash_1 = require("lodash");
class DataQueryResult {
    constructor(options) {
        this.suppressAuth = false;
        this.consistentRead = false;
        this.suppressHooks = false;
        this.pageSize = 50;
        this.currentPage = 1;
        const { suppressAuth, pageSize, dbName, collectionName, queryClass, queryOptions, consistentRead, collection, suppressHooks } = options;
        if (!pageSize || !queryOptions || !dbName || !collectionName || !queryClass) {
            (0, log_handlers_1.reportError)("Required Param/s Missing");
        }
        this.collection = collection;
        this.consistentRead = consistentRead || false;
        this.suppressHooks = suppressHooks || false;
        this.suppressAuth = suppressAuth || false;
        this.dataQueryClass = queryClass;
        this.pageSize = pageSize;
        this.queryOptions = queryOptions;
        this.dbName = dbName;
        this.collectionName = collectionName;
    }
    async getItems() {
        const { query, distinctProperty, skip, sort, fields, includes, addFields } = this.queryOptions;
        if (distinctProperty) {
            const distinctItems = await this.collection.distinct(distinctProperty, query);
            return distinctItems;
        }
        else {
            if ((0, lodash_1.size)(includes) > 0) {
                const pipeline = [];
                if ((0, lodash_1.size)(query) > 0) {
                    pipeline.push({
                        $match: query
                    });
                }
                if (sort) {
                    pipeline.push({
                        $sort: sort
                    });
                }
                if (fields) {
                    pipeline.push({
                        $project: fields
                    });
                }
                if ((0, lodash_1.size)(addFields) > 0) {
                    pipeline.push({
                        $addFields: addFields
                    });
                }
                for (const include of includes) {
                    if (include.$lookup) {
                        pipeline.push({
                            $lookup: include.$lookup
                        });
                    }
                }
                for (const include of includes) {
                    if (include.$unwind) {
                        pipeline.push({
                            $unwind: include.$unwind
                        });
                    }
                }
                pipeline.push({
                    $skip: skip || 0 + ((this.currentPage - 1) * this.pageSize)
                });
                pipeline.push({
                    $limit: this.pageSize
                });
                console.log(pipeline);
                const aggregateCursor = this.collection.aggregate(pipeline);
                if (this.consistentRead === true) {
                    aggregateCursor.readConcern('majority');
                }
                const items = await aggregateCursor.toArray();
                return items;
            }
            else {
                const findCursor = this.collection.find(query, {
                    sort,
                    projection: fields
                });
                findCursor.skip(skip || 0 + ((this.currentPage - 1) * this.pageSize));
                findCursor.limit(this.pageSize);
                if (this.consistentRead === true) {
                    findCursor.readConcern('majority');
                }
                const items = await findCursor.toArray();
                return items;
            }
        }
    }
    async getTotalCount() {
        const { query, distinctProperty } = this.queryOptions;
        if (distinctProperty) {
            const pipeline = [
                { $group: { _id: `$${distinctProperty}`, count: { $sum: 1 }, }, },
                { $group: { _id: null, distinctCount: { $sum: 1 }, }, }
            ];
            const result = await this.collection.aggregate(pipeline).toArray();
            if (result.length > 0) {
                return result[0].distinctCount;
            }
            else {
                return 0;
            }
        }
        const totalCount = await this.collection.countDocuments(query);
        return totalCount;
    }
    async getResult() {
        if (!this.collection) {
            const { collection, cleanup } = await this.connectionHandler(this.suppressAuth);
            this.collection = collection;
            this.cleanup = cleanup;
        }
        const { skip } = this.queryOptions;
        const items = await this.getItems();
        const totalCount = await this.getTotalCount();
        return {
            currentPage: this.currentPage,
            items,
            length: items.length,
            pageSize: this.pageSize,
            query: this.dataQueryClass,
            totalCount,
            totalPages: Math.ceil(totalCount / this.pageSize),
            hasNext: () => this.currentPage * this.pageSize < totalCount,
            hasPrev: () => {
                if (skip) {
                    if (skip > 0 && skip >= this.pageSize) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return this.currentPage > 1;
                }
            },
            next: async (cleanAfterRun) => {
                this.currentPage++;
                if (cleanAfterRun === true) {
                    await this.cleanup();
                }
                return this.getResult();
            },
            prev: async (cleanAfterRun) => {
                this.currentPage--;
                if (cleanAfterRun === true) {
                    await this.cleanup();
                }
                return this.getResult();
            }
        };
    }
    async connectionHandler(suppressAuth) {
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
function WeivDataQueryResult(options) {
    return new DataQueryResult(options);
}
exports.WeivDataQueryResult = WeivDataQueryResult;
