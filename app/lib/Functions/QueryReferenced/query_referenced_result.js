"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalWeivDataQueryReferencedResult = void 0;
const query_referenced_helpers_1 = require("../../Helpers/query_referenced_helpers");
const connection_provider_1 = require("../../Connection/connection_provider");
const name_helpers_1 = require("../../Helpers/name_helpers");
class InternalWeivDataQueryReferencedResult {
    constructor(collectionId, targetCollectionId, itemId, propertyName, queryOptions, options) {
        this.currentPage = 0;
        this.pageSize = 50;
        if (!collectionId || !targetCollectionId || !itemId || !propertyName || !queryOptions || !options) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, targetCollectionId, propertyName, queryOptions, options, itemId`);
        }
        const { collectionName, dbName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        this.collectionName = collectionName;
        this.dbName = dbName;
        this.targetCollectionId = targetCollectionId;
        this.itemId = itemId;
        this.propertyName = propertyName;
        this.options = options;
        this.pageSize = queryOptions.pageSize || 50;
        this.order = queryOptions.order;
    }
    getPipelineOptions() {
        return {
            pageSize: this.pageSize,
            skip: this.pageSize * this.currentPage,
            order: this.order
        };
    }
    async getItems() {
        try {
            const { consistentRead } = this.options;
            const items = await this.collection.aggregate((0, query_referenced_helpers_1.getPipeline)(this.itemId, this.targetCollectionId, this.propertyName, this.getPipelineOptions()), { readConcern: consistentRead === true ? "majority" : "local" }).toArray();
            return items;
        }
        catch (err) {
            throw Error(`WeivData - Error when getting items for queryReferenced result: ${err}`);
        }
    }
    async getResult() {
        try {
            const { suppressAuth } = this.options;
            if (!this.collection) {
                const { collection, cleanup } = await this.connectionHandler(suppressAuth || false);
                this.collection = collection;
                this.cleanup = cleanup;
            }
            const { skip } = this.getPipelineOptions();
            const items = await this.getItems();
            const { referencedItems, totalItems } = items[0];
            this.items = referencedItems;
            this.totalCount = totalItems;
            this.hasNext = () => this.currentPage * this.pageSize < totalItems;
            this.hasPrev = () => {
                if (skip) {
                    if (skip > 0 && skip >= this.pageSize) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return this.currentPage > 0;
                }
            };
            this.next = async (cleanupAfter) => {
                this.currentPage++;
                if (cleanupAfter === true) {
                    await this.cleanup();
                }
                return this.getResult();
            };
            this.prev = async (cleanupAfter) => {
                this.currentPage--;
                if (cleanupAfter === true) {
                    await this.cleanup();
                }
                return this.getResult();
            };
            return {
                items: this.items,
                totalCount: this.totalCount,
                hasNext: this.hasNext,
                hasPrev: this.hasPrev,
                next: this.next,
                prev: this.prev
            };
        }
        catch (err) {
            throw Error(`WeivData - Error when running queryReferenced function: ${err}`);
        }
    }
    async connectionHandler(suppressAuth) {
        try {
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
        catch (err) {
            throw Error(`WeivData - Error when connecting to MongoDB Client via query function class: ${err}`);
        }
    }
}
exports.InternalWeivDataQueryReferencedResult = InternalWeivDataQueryReferencedResult;
