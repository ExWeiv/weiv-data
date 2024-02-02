import { ObjectId, Db, Collection } from 'mongodb/mongodb';
import { getPipeline } from '../../Helpers/query_referenced_helpers';
import { useClient } from '../../Connection/connection_provider';
import { splitCollectionId } from '../../Helpers/name_helpers';
import { CleanupAfter, CollectionID, ConnectionCleanup, ConnectionHandlerResult, Items, WeivDataOptions, WeivDataQueryReferencedOptions, WeivDataQueryReferencedResultI } from '../../../weivdata';

export class WeivDataQueryReferencedResult {
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
    private cleanup!: ConnectionCleanup;

    /**
     * Returns the items that match the reference query.
     * @readonly
     */
    items!: Items;

    /**
     * Returns the total number of items that match the reference query.
     * @readonly
     */
    totalCount!: number;

    /**
     * Indicates if the reference query has more results.
     */
    hasNext!: () => boolean;

    /**
    * Indicates if the reference query has previous results.
    */
    hasPrev!: () => boolean;

    /**
     * Retrieves the next page of reference query results.
     * 
     * @param cleanupAfter Set connection cleaning. (Defaults to false.)
     * @returns {Promise<WeivDataQueryReferencedResult>} Fulfilled - A reference query result object with the next page of query results. Rejected - The errors that caused the rejection.
     */
    next!: (cleanupAfter?: CleanupAfter) => Promise<WeivDataQueryReferencedResultI>;

    /**
     * Retrieves the previous page of reference query results.
     * 
     * @param cleanupAfter Set connection cleaning. (Defaults to false.)
     * @returns {Promise<WeivDataQueryReferencedResult>} Fulfilled - A query result object with the previous page of query results. Rejected - The errors that caused the rejection.
     */
    prev!: (cleanupAfter?: CleanupAfter) => Promise<WeivDataQueryReferencedResultI>;


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
    private async getItems(): Promise<Items> {
        try {
            const { consistentRead } = this.options;
            const items = await this.collection.aggregate(getPipeline(this.itemId, this.targetCollectionId, this.propertyName, this.getPipelineOptions()),
                { readConcern: consistentRead === true ? "majority" : "local" }).toArray();
            return items;
        } catch (err) {
            throw Error(`WeivData - Error when getting items for queryReferenced result: ${err}`);
        }
    }

    /**@internal */
    async getResult(): Promise<WeivDataQueryReferencedResultI> {
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
                    } else {
                        return false;
                    }
                } else {
                    return this.currentPage > 0;
                }
            }
            this.next = async (cleanupAfter?: CleanupAfter) => {
                this.currentPage++;
                if (cleanupAfter === true) {
                    await this.cleanup();
                }
                return this.getResult();
            }
            this.prev = async (cleanupAfter?: CleanupAfter) => {
                this.currentPage--;
                if (cleanupAfter === true) {
                    await this.cleanup();
                }
                return this.getResult();
            }

            return this;
        } catch (err) {
            throw Error(`WeivData - Error when running queryReferenced function: ${err}`);
        }
    }

    /**@internal */
    private async connectionHandler(suppressAuth: boolean): Promise<ConnectionHandlerResult> {
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
            throw Error(`WeivData - Error when connecting to MongoDB Client via query function class: ${err}`);
        }
    }
}