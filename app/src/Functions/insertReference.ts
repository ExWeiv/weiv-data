import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';
import { getCurrentItemId, getReferences } from '../Helpers/reference_helpers';

/**
 * @description Inserts a reference in the specified property.
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property to insert the reference into.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - When the references have been inserted. Rejected - The error that caused the rejection.
 */
export async function insertReference(collectionId: string, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
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

        const { suppressAuth, cleanupAfter, consistentRead } = options || { suppressAuth: false, cleanupAfter: false, consistentRead: false };
        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { modifiedCount } = await collection.updateOne(
            { _id: itemId },
            { $addToSet: { [propertyName]: { $each: references } }, $set: { _updatedDate: new Date() } },
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (modifiedCount <= 0) {
            reportError("Operation is not succeed");
        }

        if (cleanupAfter === true) {
            await cleanup();
        }
    } catch (err) {
        console.error(err);
    }
}