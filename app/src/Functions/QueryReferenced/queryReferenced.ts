import type { CollectionID, ItemID, WeivDataOptions, WeivDataQueryReferencedOptions, WeivDataQueryReferencedResult } from '@exweiv/weiv-data';
import { QueryReferencedResult } from './query_referenced_result';
import { validateParams } from '../../Helpers/validator';

export async function queryReferenced(collectionId: CollectionID, targetCollectionId: string, itemId: ItemID, propertyName: string, queryOptions: WeivDataQueryReferencedOptions, options?: WeivDataOptions): Promise<WeivDataQueryReferencedResult> {
    try {
        const { safeItemId, safeQueryOptions, safeOptions } = await validateParams<"queryReferenced">(
            { collectionId, targetCollectionId, itemId, propertyName, queryOptions, options },
            ["collectionId", "targetCollectionId", "itemId", "propertyName", "queryOptions"],
            "queryReferenced"
        );

        const referencedClass = new QueryReferencedResult(collectionId, targetCollectionId, safeItemId, propertyName, safeQueryOptions, safeOptions || {});
        const result = await referencedClass.getResult();
        return result;
    } catch (err) {
        throw Error(`WeivData - Error when querying referenced items: ${err}`);
    }
}