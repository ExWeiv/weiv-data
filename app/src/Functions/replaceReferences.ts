import { ReferringItem, ReferencedItem, WeivDataOptions, CollectionID } from '../../weivdata';
import { getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import { update } from './update';

/**
 * Replaces current references with references in the specified property.
 * 
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property to replaces the references in.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<void>} Fulfilled - When the references have been inserted. Rejected - The error that caused the rejection.
 */
export async function replaceReferences(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }

        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const updated = await update(collectionId, { _id: itemId, [propertyName]: references }, options);

        if (!updated) {
            throw Error(`WeivData - Error when replacing references, result: ${updated}`)
        }
    } catch (err) {
        throw Error(`WeivData - Error when replacing references: ${err}`)
    }
}