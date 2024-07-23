import type { CollectionID, Item, ItemID, WeivDataOptions, WeivDataQueryReferencedOptions, WeivDataQueryReferencedResult } from '@exweiv/weiv-data';
import { QueryReferencedResult } from './query_referenced_result';
import { validateParams } from '../../Helpers/validator';
import { kaptanLogar } from '../../Errors/error_manager';

export async function queryReferenced(collectionId: CollectionID, targetCollectionId: string, itemId: ItemID, propertyName: string, queryOptions?: WeivDataQueryReferencedOptions, options?: WeivDataOptions): Promise<WeivDataQueryReferencedResult<Item>> {
    try {
        const { safeItemId, safeQueryOptions, safeOptions } = await validateParams<"queryReferenced">(
            { collectionId, targetCollectionId, itemId, propertyName, queryOptions, options },
            ["collectionId", "targetCollectionId", "itemId", "propertyName"],
            "queryReferenced"
        );

        const referencedClass = new QueryReferencedResult(collectionId, targetCollectionId, safeItemId, propertyName, safeQueryOptions || { pageSize: 50, order: 'asc' }, safeOptions || {});
        return await referencedClass.getResult();
    } catch (err) {
        kaptanLogar("00017", `when querying referenced items: ${err}`);
    }
}