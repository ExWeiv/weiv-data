import { Collection, Db, Document } from "mongodb/mongodb";
import { sortAggregationPipeline } from "../Helpers/pipeline_helpers";
import { useClient } from '../Connection/connection_provider';
import { reportError } from '../Log/log_handlers';

class DataAggregateResult {
    private pageSize: number;
    private currentPage = 1;
    private pipeline: object[];
    private db!: Db;
    private databaseName: string;
    private collectionName: string;
    private suppressAuth = false
    private collection!: Collection;

    constructor(pageSize: number = 50, pipeline: object[], databaseName: string, collectionName: string, suppressAuth: boolean = false) {
        if (!pipeline || !databaseName || !collectionName) {
            reportError("Required Parameters Missing (Internal Error)");
        }

        this.pageSize = pageSize;
        this.currentPage = 1;
        this.collectionName = collectionName;
        this.databaseName = databaseName;
        this.pipeline = pipeline;
        this.suppressAuth = suppressAuth;
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

    private async getTotalItems(): Promise<number> {
        const result = await this.collection
            .aggregate([{ $count: "totalItems" }])
            .toArray();
        return result.length > 0 ? result[0].totalItems : 0;
    }

    async getResult(): Promise<AggregateResult> {
        // Setup a connection from the pool
        const { collection, cleanup } = await this.connectionHandler(this.suppressAuth);
        this.collection = collection;

        const items = await this.getItems();
        const length = await this.getTotalItems();

        return {
            items,
            length,
            hasNext: () => this.currentPage * this.pageSize < length,
            next: async (cleanAfterRun: boolean = false) => {
                this.currentPage++;
                if (cleanAfterRun === true) {
                    // Close the connection after job completed (if cleanAfterRun === true)
                    cleanup();
                }
                return this.getResult();
            },
        };
    }

    private async connectionHandler(suppressAuth: boolean): Promise<ConnectionResult> {
        const { pool, cleanup, memberId } = await useClient(suppressAuth);

        if (this.databaseName) {
            this.db = pool.db(this.databaseName);
        } else {
            this.db = pool.db("exweiv");
        }

        const collection = this.db.collection(this.collectionName);
        return { collection, cleanup, memberId };
    }
}

export function WeivDataAggregateResult(pageSize: number = 50, pipeline: object[], databaseName: string, collectionName: string, suppressAuth: boolean = false) {
    return new DataAggregateResult(pageSize, pipeline, databaseName, collectionName, suppressAuth);
}
