"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeivDataAggregateResult = void 0;
const pipeline_helpers_1 = require("../Helpers/pipeline_helpers");
const connection_provider_1 = require("../Connection/connection_provider");
const log_handlers_1 = require("../Log/log_handlers");
class DataAggregateResult {
    constructor(options) {
        this.pageSize = 50;
        this.currentPage = 1;
        this.suppressAuth = false;
        const { pageSize, pipeline, databaseName, collectionName, suppressAuth } = options;
        if (!pipeline || !databaseName || !collectionName) {
            (0, log_handlers_1.reportError)("Required Parameters Missing (Internal Error)");
        }
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.collectionName = collectionName;
        this.databaseName = databaseName;
        this.pipeline = pipeline;
        this.suppressAuth = suppressAuth || false;
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
    async getResult() {
        const { collection, cleanup } = await this.connectionHandler(this.suppressAuth);
        this.collection = collection;
        const items = await this.getItems();
        return {
            items,
            length: items.length,
            hasNext: () => this.currentPage * this.pageSize < length,
            next: async (cleanupAfter = false) => {
                this.currentPage++;
                if (cleanupAfter === true) {
                    await cleanup();
                }
                return this.getResult();
            },
        };
    }
    async connectionHandler(suppressAuth) {
        const { pool, cleanup, memberId } = await (0, connection_provider_1.useClient)(suppressAuth);
        if (this.databaseName) {
            this.db = pool.db(this.databaseName);
        }
        else {
            this.db = pool.db("exweiv");
        }
        const collection = this.db.collection(this.collectionName);
        return { collection, cleanup, memberId };
    }
}
function WeivDataAggregateResult(options) {
    return new DataAggregateResult(options);
}
exports.WeivDataAggregateResult = WeivDataAggregateResult;
