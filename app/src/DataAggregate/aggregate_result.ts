import { Collection, Db, Document } from "mongodb/mongodb";
import { sortAggregationPipeline } from "../Helpers/pipeline_helpers";
import { useClient } from '../Connection/connection_provider';
import { splitCollectionId } from "../Helpers/name_helpers";
import { AggregateResult, CleanupAfter, CollectionID, ConnectionHandlerReturns, PipelineArray, SuppressAuth } from "../../weiv-data";

interface DataAggregateResultInterface {
    items: Document[],
    length: number,
    hasNext: () => boolean,
    next: (cleanupAfter?: CleanupAfter) => Promise<AggregateResult>
}

export class DataAggregateResult implements DataAggregateResultInterface {
    protected pageSize: number = 50;
    protected currentPage = 1;
    protected pipeline!: PipelineArray;
    protected db!: Db;
    protected collectionName: string;
    protected dbName: string;
    protected collection!: Collection;

    // Public Keys
    items!: Document[];
    length!: number;
    hasNext!: () => boolean;
    next!: (cleanupAfter?: CleanupAfter) => Promise<AggregateResult>;

    constructor(collectionId: CollectionID) {
        const { dbName, collectionName } = splitCollectionId(collectionId);

        this.collectionName = collectionName;
        this.dbName = dbName;
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

    /**
     * @description The `run()` function returns a Promise that resolves to the results found by the aggregation and some information about the results.
     * @returns {AggregateResult} Fulfilled - A Promise that resolves to the results of the aggregation. Rejected - Error that caused the aggregation to fail.
     */
    protected async getResult(suppressAuth: SuppressAuth): Promise<AggregateResult> {
        // Setup a connection from the pool
        const { collection, cleanup } = await this.connectionHandler(suppressAuth);
        this.collection = collection;

        const items = await this.getItems();

        this.items = items;
        this.length = items.length;
        this.hasNext = () => this.currentPage * this.pageSize < length;
        this.next = async (cleanupAfter: CleanupAfter) => {
            this.currentPage++;
            if (cleanupAfter === true) {
                // Close the connection after job completed (if cleanupAfter === true)
                await cleanup();
            }
            return this.getResult(suppressAuth);
        }

        return this;
    }

    protected async connectionHandler(suppressAuth: SuppressAuth): Promise<ConnectionHandlerReturns> {
        try {
            const { pool, cleanup, memberId } = await useClient(suppressAuth);

            if (this.dbName) {
                this.db = pool.db(this.dbName);
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
