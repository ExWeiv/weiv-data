import { ReferringItem, ReferencedItem, WeivDataOptions, CollectionID } from '../../weivdata';
import { connectionHandler } from '../Helpers/connection_helpers';
import { getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import _ from 'lodash';

/**
 * Removes a reference from the specified property.
 * 
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property to remove the reference from.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<object>} Fulfilled - When the references have been removed. Rejected - The error that caused the rejection.
 */
export async function removeReference(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }

        const { suppressAuth, cleanupAfter, consistentRead } = options || {};
        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne(
            { _id: itemId },
            { $pull: { [propertyName]: { $in: references } }, $set: { _updatedDate: new Date() } },
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (!acknowledged || modifiedCount === 0) {
            throw Error(`WeivData - Error when removing references, acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`)
        } else {
            return { result: true, updatedCount: modifiedCount };
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing references: ${err}`);
    }
}