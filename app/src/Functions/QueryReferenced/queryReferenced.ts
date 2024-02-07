import { convertStringId } from '../../Helpers/item_helpers';
import { WeivDataQueryReferencedResult } from './query_referenced_result';
import { CollectionID, ItemID, WeivDataOptions, WeivDataQueryReferencedOptions, WeivDataQueryReferencedResultI } from '../../../weivdata';

/**
 * Gets the full items referenced in the specified property.
 * 
 * @param collectionId The ID of the collection that contains the referring item.
 * @param targetCollectionId The ID of the collection that contains the referenced items.
 * @param itemId The referring item's ID.
 * @param propertyName The property that contains the references to the referenced items.
 * @param queryOptions An object containing options to use when querying referenced items.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<WeivDataQueryReferencedResultI>} Fulfilled - The referenced items. Rejected - The error that caused the rejection.
 */
export async function queryReferenced(collectionId: CollectionID, targetCollectionId: string, itemId: ItemID, propertyName: string, queryOptions: WeivDataQueryReferencedOptions, options?: WeivDataOptions): Promise<WeivDataQueryReferencedResultI> {
    try {
        if (!collectionId || !itemId || !targetCollectionId || !propertyName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, targetCollectionId, propertyName or itemId`);
        }

        const editedItemId = convertStringId(itemId);
        const referencedClass = new WeivDataQueryReferencedResult(collectionId, targetCollectionId, editedItemId, propertyName, queryOptions, options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, consistentRead: false });
        const result = await referencedClass.getResult();
        return result;
    } catch (err) {
        throw Error(`WeivData - Error when querying referenced items: ${err}`);
    }
}