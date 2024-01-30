import { Document, ObjectId, Db, Collection } from 'mongodb/mongodb';
import { getPipeline } from '../../Helpers/query_referenced_helpers';
import { useClient } from '../../Connection/connection_provider';
import { splitCollectionId } from '../../Helpers/name_helpers';

export class QueryReferencedResult {
    private targetCollectionId: string;
    private itemId: ObjectId;
    private propertyName: string;
    private options: WeivDataOptions;
    private currentPage = 0;
    private pageSize = 50;

    private collectionName: string;
    private dbName: string;
    private db!: Db;
    private collection!: Collection;
    private cleanup!: ConnectionCleanUp;

    constructor(collectionId: string, targetCollectionId: string, itemId: ObjectId, propertyName: string, queryOptions: QueryReferencedOptions, options: WeivDataOptions) {
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
    }


    private getPipelineOptions() {
        return {
            pageSize: this.pageSize,
            skip: this.pageSize * this.currentPage
        }
    }

    private async getItems(): Promise<Document[]> {
        try {
            const { consistentRead } = this.options;
            const items = await this.collection.aggregate(getPipeline(this.itemId, this.targetCollectionId, this.propertyName, this.getPipelineOptions()),
                { readConcern: consistentRead === true ? "majority" : "local" }).toArray();
            return items;
        } catch (err) {
            throw Error(`WeivData - Error when getting items for queryReferenced result: ${err}`);
        }
    }

    async getResult(): Promise<WeivDaaQueryReferencedResult> {
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

            const result = {
                items: referencedItems,
                totalCount: totalItems,
                hasNext: () => this.currentPage * this.pageSize < totalItems,
                hasPrev: () => {
                    if (skip) {
                        if (skip > 0 && skip >= this.pageSize) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return this.currentPage > 0;
                    }
                },
                next: async (cleanupAfter?: boolean) => {
                    this.currentPage++;
                    if (cleanupAfter === true) {
                        await this.cleanup();
                    }
                    return this.getResult();
                },
                prev: async (cleanupAfter?: boolean) => {
                    this.currentPage--;
                    if (cleanupAfter === true) {
                        await this.cleanup();
                    }
                    return this.getResult();
                }
            }

            return result;
        } catch (err) {
            throw Error(`WeivData - Error when running queryReferenced function: ${err}`);
        }
    }

    private async connectionHandler(suppressAuth: boolean): Promise<ConnectionResult> {
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