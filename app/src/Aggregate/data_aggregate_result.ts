import { Collection, Db } from "mongodb/mongodb";
import { type PipelineArray, sortAggregationPipeline } from "../Helpers/pipeline_helpers";
import { useClient } from '../Connection/automatic_connection_provider';
import { splitCollectionId } from "../Helpers/name_helpers";
import type { CollectionID, Item, WeivDataAggregateResult } from "@exweiv/weiv-data";
import type { ConnectionHandlerResult } from "../Helpers/collection";

/**
 * The results of an aggregation, containing the aggregated values.
 * @internal
 */
export class AggregateResult {
    protected pageSize: number = 50;
    protected currentPage = 1;
    protected pipeline!: PipelineArray;
    protected db!: Db;
    protected collectionName: string;
    protected dbName: string;
    protected collection!: Collection;

    protected items!: Item[];
    protected length!: number;
    protected hasNext!: () => boolean;
    protected next!: () => Promise<WeivDataAggregateResult>;

    /**
     * @internal
     */
    constructor(collectionId: CollectionID) {
        const { dbName, collectionName } = splitCollectionId(collectionId);

        this.collectionName = collectionName;
        this.dbName = dbName;
    }

    private async getItems(): Promise<Item[]> {
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

    protected async getResult(suppressAuth?: boolean): Promise<WeivDataAggregateResult> {
        // Setup a connection from the pool
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
        }

        return {
            length: this.length,
            items: this.items,
            hasNext: this.hasNext,
            next: this.next
        };
    }

    protected async connectionHandler(suppressAuth?: boolean): Promise<ConnectionHandlerResult<false>> {
        try {
            const { pool, memberId } = await useClient(suppressAuth);

            if (this.dbName) {
                this.db = pool.db(this.dbName);
            } else {
                this.db = pool.db("ExWeiv");
            }

            const collection = this.db.collection(this.collectionName);
            return { collection, memberId };
        } catch (err) {
            throw Error(`WeivData - Error when connecting to MongoDB Client via aggregate function class: ${err}`);
        }
    }
}
