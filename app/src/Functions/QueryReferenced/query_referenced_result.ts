import { ObjectId, Db, Collection } from 'mongodb/mongodb';
import { getPipeline } from '../../Helpers/query_referenced_helpers';
import type { CollectionID, WeivDataOptions, WeivDataQueryReferencedResult, WeivDataQueryReferencedOptions, Item } from '@exweiv/weiv-data';
import { connectionHandler } from '../../Helpers/connection_helpers';
import { kaptanLogar } from '../../Errors/error_manager';
import { recursivelyConvertIds } from '../../Helpers/internal_id_converter';
import { copyOwnPropsOnly } from '../../Helpers/validator';
import { getConvertIdsValue } from '../../Config/weiv_data_config';

export class QueryReferencedResult {
    private targetCollectionId: string;
    private itemId: ObjectId;
    private propertyName: string;
    private options: WeivDataOptions;

    private currentPage = 0;
    private pageSize = 50;
    private order: 'asc' | 'desc';

    private _collectionId!: CollectionID;
    private _database!: Db;
    private _collection!: Collection;

    constructor(collectionId: CollectionID, targetCollectionId: string, itemId: ObjectId, propertyName: string, queryOptions: WeivDataQueryReferencedOptions, options: WeivDataOptions) {
        if (!collectionId || !targetCollectionId || !itemId || !propertyName || !queryOptions || !options) {
            kaptanLogar("00017", `one or more required params are undefined when querying references`);
        }

        this._collectionId = collectionId;
        this.targetCollectionId = targetCollectionId;
        this.itemId = itemId;
        this.propertyName = propertyName;
        this.options = options;
        this.pageSize = queryOptions.pageSize || 50;
        this.order = queryOptions.order || 'asc';
    }

    async getResult(): Promise<WeivDataQueryReferencedResult<Item>> {
        try {
            const { suppressAuth, readConcern, convertIds } = { convertIds: getConvertIdsValue(), ...copyOwnPropsOnly(this.options) };
            await this._handleConnection_(suppressAuth);

            const pipelineOptions = this.__getPipelineOptions__();
            const pipeline = getPipeline(this.itemId, this.targetCollectionId, this.propertyName, pipelineOptions);
            const aggregate = this._collection.aggregate(pipeline, { readConcern });

            const items = await aggregate.toArray();
            const hasNext = await aggregate.hasNext();
            const { referencedItems, totalItems } = items[0];

            return {
                items: convertIds ? recursivelyConvertIds(referencedItems) : referencedItems,
                totalCount: totalItems,
                hasNext: () => hasNext,
                hasPrev: () => this.currentPage > 0,
                next: async () => {
                    this.currentPage++;
                    return await this.getResult();
                },
                prev: async () => {
                    this.currentPage--;
                    return await this.getResult();
                }
            };
        } catch (err) {
            kaptanLogar("00017", `when running queryReferenced function: ${err}`);
        }
    }

    // HELPER FUNCTIONS
    private async _handleConnection_(suppressAuth?: boolean): Promise<void> {
        if (!this._collection || !this._database) {
            const { collection, database } = await connectionHandler(this._collectionId, suppressAuth);
            this._database = database;
            this._collection = collection;
        }
    }

    private __getPipelineOptions__() {
        return {
            pageSize: this.pageSize,
            skip: this.pageSize * this.currentPage,
            order: this.order
        }
    }
}