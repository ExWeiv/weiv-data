"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryReferencedResult = void 0;
const query_referenced_helpers_1 = require("../../Helpers/query_referenced_helpers");
const connection_helpers_1 = require("../../Helpers/connection_helpers");
class QueryReferencedResult {
    constructor(collectionId, targetCollectionId, itemId, propertyName, queryOptions, options) {
        this.currentPage = 0;
        this.pageSize = 50;
        if (!collectionId || !targetCollectionId || !itemId || !propertyName || !queryOptions || !options) {
            throw new Error(`one or more required param is undefined - Required Params: collectionId, targetCollectionId, propertyName, queryOptions, options, itemId`);
        }
        this._collectionId = collectionId;
        this.targetCollectionId = targetCollectionId;
        this.itemId = itemId;
        this.propertyName = propertyName;
        this.options = options;
        this.pageSize = queryOptions.pageSize || 50;
        this.order = queryOptions.order || 'asc';
    }
    async getResult() {
        try {
            const { suppressAuth, readConcern } = this.options;
            await this._handleConnection_(suppressAuth);
            const pipelineOptions = this.__getPipelineOptions__();
            const pipeline = (0, query_referenced_helpers_1.getPipeline)(this.itemId, this.targetCollectionId, this.propertyName, pipelineOptions);
            const aggregate = this._collection.aggregate(pipeline, { readConcern });
            const items = await aggregate.toArray();
            const hasNext = await aggregate.hasNext();
            const { referencedItems, totalItems } = items[0];
            return {
                items: referencedItems,
                totalCount: totalItems,
                hasNext: () => hasNext,
                hasPrev: () => this.currentPage > 0,
                next: async () => {
                    this.currentPage++;
                    return await this.getResult();
                },
                prev: async () => {
                    this.currentPage--;
                    return await this.getResult();
                }
            };
        }
        catch (err) {
            throw new Error(`when running queryReferenced function: ${err}`);
        }
    }
    async _handleConnection_(suppressAuth) {
        if (!this._collection || !this._database) {
            const { collection, database } = await (0, connection_helpers_1.connectionHandler)(this._collectionId, suppressAuth);
            this._database = database;
            this._collection = collection;
        }
    }
    __getPipelineOptions__() {
        return {
            pageSize: this.pageSize,
            skip: this.pageSize * this.currentPage,
            order: this.order
        };
    }
}
exports.QueryReferencedResult = QueryReferencedResult;
