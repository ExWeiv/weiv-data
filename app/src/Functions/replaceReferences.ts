import { reportError } from '../Log/log_handlers';
import { getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import { update } from './update';

/**
 * @description Replaces current references with references in the specified property.
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property to replaces the references in.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - When the references have been inserted. Rejected - The error that caused the rejection.
 */
export async function replaceReferences(collectionId: string, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        if (!collectionId) {
            reportError("Collection and Database name is required");
        }

        if (!propertyName) {
            reportError("Property name is required");
        }

        if (!referringItem) {
            reportError("Referring item is required");
        }

        if (!referencedItem) {
            reportError("Referenced item/s required");
        }

        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const updated = await update(collectionId, { _id: itemId, [propertyName]: references.length > 1 ? references : references[0] }, options);
        if (!updated) {
            reportError("Operation failed");
        }
    } catch (err) {
        console.error(err);
    }
}