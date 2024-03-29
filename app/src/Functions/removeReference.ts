import type { CollectionID, WeivDataOptions } from '../Helpers/collection';
import { connectionHandler } from '../Helpers/connection_helpers';
import { type ReferencedItem, type ReferringItem, getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import _ from 'lodash';

/**
 * Removes a reference from the specified property.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // Item id
 * const itemId = "..."
 * 
 * // References to be removed. `ItemId[]`
 * const cpus = ["cpuId1", "cpuId3"]
 * 
 * const result = await weivData.removeReference("Clusters/Ortakoy", "availableCPUs", itemId, cpus, {suppressAuth: true})
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property to remove the reference from.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<void>} Fulfilled - When the references have been removed. Rejected - The error that caused the rejection.
 */
export async function removeReference(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }

        const { suppressAuth, readConcern } = options || {};
        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne(
            { _id: itemId },
            { $pull: { [propertyName]: { $in: references } }, $set: { _updatedDate: new Date() } },
            { readConcern: readConcern ? readConcern : "local" }
        );

        if (!acknowledged || modifiedCount <= 0) {
            throw Error(`WeivData - Error when removing references, acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`)
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing references: ${err}`);
    }
}