import { convertStringId } from '../../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';
import { QueryReferencedResult } from './query_referenced_result';

/**
 * @description Gets the full items referenced in the specified property.
 * @param collectionId The ID of the collection that contains the referring item.
 * @param targetCollectionId The ID of the collection that contains the referenced items.
 * @param itemId The referring item's ID.
 * @param propertyName The property that contains the references to the referenced items.
 * @param queryOptions An object containing options to use when querying referenced items.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The referenced items. Rejected - The error that caused the rejection.
 */
export async function queryReferenced(collectionId: string, targetCollectionId: string, itemId: string | ObjectId, propertyName: string, queryOptions: QueryReferencedOptions, options?: WeivDataOptions): Promise<WeivDaaQueryReferencedResult> {
    try {
        if (!collectionId || !itemId || !targetCollectionId || !propertyName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, targetCollectionId, propertyName or itemId`);
        }

        const editedItemId = convertStringId(itemId);
        const referencedClass = new QueryReferencedResult(collectionId, targetCollectionId, editedItemId, propertyName, queryOptions, options || {});
        const result = await referencedClass.getResult();
        return result;
    } catch (err) {
        throw Error(`WeivData - Error when querying referenced items: ${err}`);
    }
}