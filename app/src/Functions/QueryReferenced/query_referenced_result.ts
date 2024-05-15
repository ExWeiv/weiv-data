import { ObjectId, Db, Collection } from 'mongodb/mongodb';
import { getPipeline } from '../../Helpers/query_referenced_helpers';
import { useClient } from '../../Connection/automatic_connection_provider';
import { splitCollectionId } from '../../Helpers/name_helpers';
import type { CollectionID, Item, WeivDataOptions, WeivDataQueryReferencedResult, WeivDataQueryReferencedOptions } from '@exweiv/weiv-data';
import type { ConnectionHandlerResult } from '../../Helpers/collection';

export class QueryReferencedResult {
    private targetCollectionId: string;
    private itemId: ObjectId;
    private propertyName: string;
    private options: WeivDataOptions;
    private currentPage = 0;
    private pageSize = 50;
    private order: 'asc' | 'desc';

    private collectionName: string;
    private dbName: string;
    private db!: Db;
    private collection!: Collection;

    protected items!: Item[];
    protected totalCount!: number;
    protected hasNext!: () => boolean;
    protected hasPrev!: () => boolean;
    protected next!: () => Promise<WeivDataQueryReferencedResult>;
    protected prev!: () => Promise<WeivDataQueryReferencedResult>;


    /**@internal */
    constructor(collectionId: CollectionID, targetCollectionId: string, itemId: ObjectId, propertyName: string, queryOptions: WeivDataQueryReferencedOptions, options: WeivDataOptions) {
        if (!collectionId || !targetCollectionId || !itemId || !propertyName || !queryOptions || !options) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, targetCollectionId, propertyName, queryOptions, options, itemId`);
        }

        const { collectionName, dbName } = splitCollectionId(collectionId);
        this.collectionName = collectionName;
        this.dbName = dbName;

        this.targetCollectionId = targetCollectionId;
        this.itemId = itemId;
        this.propertyName = propertyName;
        this.options = options;
        this.pageSize = queryOptions.pageSize || 50;
        this.order = queryOptions.order;
    }

    /**@internal */
    private getPipelineOptions() {
        return {
            pageSize: this.pageSize,
            skip: this.pageSize * this.currentPage,
            order: this.order
        }
    }

    /**@internal */
    private async getItems(): Promise<Item[]> {
        try {
            const { readConcern } = this.options;
            const items = await this.collection.aggregate(getPipeline(this.itemId, this.targetCollectionId, this.propertyName, this.getPipelineOptions()),
                { readConcern: readConcern ? readConcern : "local" }).toArray();
            return items;
        } catch (err) {
            throw Error(`WeivData - Error when getting items for queryReferenced result: ${err}`);
        }
    }

    /**@internal */
    async getResult(): Promise<WeivDataQueryReferencedResult> {
        try {
            const { suppressAuth } = this.options;
            if (!this.collection) {
                const { collection } = await this.connectionHandler(suppressAuth || false);
                this.collection = collection;
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
                    } else {
                        return false;
                    }
                } else {
                    return this.currentPage > 0;
                }
            }
            this.next = async () => {
                this.currentPage++;
                return this.getResult();
            }
            this.prev = async () => {
                this.currentPage--;
                return this.getResult();
            }

            return {
                items: this.items,
                totalCount: this.totalCount,
                hasNext: this.hasNext,
                hasPrev: this.hasPrev,
                next: this.next,
                prev: this.prev
            };
        } catch (err) {
            throw Error(`WeivData - Error when running queryReferenced function: ${err}`);
        }
    }

    /**@internal */
    private async connectionHandler(suppressAuth: boolean): Promise<ConnectionHandlerResult<false>> {
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
            throw Error(`WeivData - Error when connecting to MongoDB Client via queryReferencedResult class: ${err}`);
        }
    }
}