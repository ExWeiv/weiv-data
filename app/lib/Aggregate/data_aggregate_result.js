"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateResult = void 0;
const pipeline_helpers_1 = require("../Helpers/pipeline_helpers");
const automatic_connection_provider_1 = require("../Connection/automatic_connection_provider");
const name_helpers_1 = require("../Helpers/name_helpers");
class AggregateResult {
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
        if (!this.collection) {
            const { collection } = await this.connectionHandler(suppressAuth);
            this.collection = collection;
        }
        const items = await this.getItems();
        this.items = items;
        this.length = items.length;
        this.hasNext = () => this.currentPage * this.pageSize < length;
        this.next = async () => {
            this.currentPage++;
            return this.getResult(suppressAuth);
        };
        return {
            length: this.length,
            items: this.items,
            hasNext: this.hasNext,
            next: this.next
        };
    }
    async connectionHandler(suppressAuth) {
        try {
            const { pool, memberId } = await (0, automatic_connection_provider_1.useClient)(suppressAuth);
            if (this.dbName) {
                this.db = pool.db(this.dbName);
            }
            else {
                this.db = pool.db("ExWeiv");
            }
            const collection = this.db.collection(this.collectionName);
            return { collection, memberId };
        }
        catch (err) {
            throw Error(`WeivData - Error when connecting to MongoDB Client via aggregate function class: ${err}`);
        }
    }
}
exports.AggregateResult = AggregateResult;
