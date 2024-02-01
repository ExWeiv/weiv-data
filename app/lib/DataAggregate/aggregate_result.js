"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAggregateResult = void 0;
const pipeline_helpers_1 = require("../Helpers/pipeline_helpers");
const connection_provider_1 = require("../Connection/connection_provider");
const name_helpers_1 = require("../Helpers/name_helpers");
class DataAggregateResult {
    constructor(collectionId) {
        this.pageSize = 50;
        this.currentPage = 1;
        const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        this.collectionName = collectionName;
        this.dbName = dbName;
    }
    async getItems() {
        const currentSkip = this.pipeline.find((stage) => "$skip" in stage);
        if (currentSkip) {
            this.pipeline = this.pipeline.filter((stage) => !("$skip" in stage));
            this.pipeline.push({
                $skip: (this.currentPage - 1) * this.pageSize,
            });
        }
        else {
            this.pipeline.push({
                $skip: (this.currentPage - 1) * this.pageSize,
            });
        }
        this.pipeline = (0, pipeline_helpers_1.sortAggregationPipeline)(this.pipeline);
        const items = await this.collection.aggregate(this.pipeline).toArray();
        return items;
    }
    async getResult(suppressAuth) {
        const { collection, cleanup } = await this.connectionHandler(suppressAuth);
        this.collection = collection;
        const items = await this.getItems();
        this.items = items;
        this.length = items.length;
        this.hasNext = () => this.currentPage * this.pageSize < length;
        this.next = async (cleanupAfter) => {
            this.currentPage++;
            if (cleanupAfter === true) {
                await cleanup();
            }
            return this.getResult(suppressAuth);
        };
        return this;
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
            throw Error(`WeivData - Error when connecting to MongoDB Client via aggregate function class: ${err}`);
        }
    }
}
exports.DataAggregateResult = DataAggregateResult;
