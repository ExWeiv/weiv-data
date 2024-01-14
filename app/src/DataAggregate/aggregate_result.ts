import { Collection, Db, Document } from "mongodb/mongodb";
import { sortAggregationPipeline } from "../Helpers/pipeline_helpers";
import { useClient } from '../Connection/connection_provider';

class DataAggregateResult {
    private pageSize: number = 50;
    private currentPage = 1;
    private pipeline: object[];
    private db!: Db;
    private databaseName: string;
    private collectionName: string;
    private suppressAuth = false
    private collection!: Collection;

    constructor(options: AggregateResultOptions) {
        const { pageSize, pipeline, databaseName, collectionName, suppressAuth } = options;

        if (!pipeline || !databaseName || !collectionName) {
            throw Error(`WeivData - Required Parameters Missing (Internal API Error) - please report this BUG`);
        }

        this.pageSize = pageSize;
        this.currentPage = 1;
        this.collectionName = collectionName;
        this.databaseName = databaseName;
        this.pipeline = pipeline;
        this.suppressAuth = suppressAuth || false;
    }

    private async getItems(): Promise<Document[]> {
        const currentSkip = this.pipeline.find((stage) => "$skip" in stage);

        if (currentSkip) {
            this.pipeline = this.pipeline.filter((stage) => !("$skip" in stage));
            this.pipeline.push({
                $skip: (this.currentPage - 1) * this.pageSize,
            });
        } else {
            this.pipeline.push({
                $skip: (this.currentPage - 1) * this.pageSize,
            });
        }

        this.pipeline = sortAggregationPipeline(this.pipeline);
        const items = await this.collection.aggregate(this.pipeline).toArray();
        return items;
    }

    async getResult(): Promise<AggregateResult> {
        // Setup a connection from the pool
        const { collection, cleanup } = await this.connectionHandler(this.suppressAuth);
        this.collection = collection;

        const items = await this.getItems();

        return {
            items,
            length: items.length,
            hasNext: () => this.currentPage * this.pageSize < length,
            next: async (cleanupAfter: boolean = false) => {
                this.currentPage++;
                if (cleanupAfter === true) {
                    // Close the connection after job completed (if cleanupAfter === true)
                    await cleanup();
                }
                return this.getResult();
            },
        };
    }

    private async connectionHandler(suppressAuth: boolean): Promise<ConnectionResult> {
        try {
            const { pool, cleanup, memberId } = await useClient(suppressAuth);

            if (this.databaseName) {
                this.db = pool.db(this.databaseName);
            } else {
                this.db = pool.db("exweiv");
            }

            const collection = this.db.collection(this.collectionName);
            return { collection, cleanup, memberId };
        } catch (err) {
            throw Error(`WeivData - Error when connecting to MongoDB Client via aggregate function class: ${err}`);
        }
    }
}

export function WeivDataAggregateResult(options: AggregateResultOptions) {
    return new DataAggregateResult(options);
}
