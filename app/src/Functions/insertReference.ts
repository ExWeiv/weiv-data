import { WeivDataOptions, CollectionID } from '../Helpers/collection';
import { connectionHandler } from '../Helpers/connection_helpers';
import { type ReferencedItem, type ReferringItem, getCurrentItemId, getReferences } from '../Helpers/reference_helpers';

/**
 * Inserts a reference in the specified property.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // Item id
 * const itemId = "..."
 * 
 * // References to be inserted. `ItemId[]`
 * const cpus = ["cpuId2", "cpuId4"]
 * 
 * const result = await weivData.insertReference("Clusters/Ortakoy", "availableCPUs", itemId, cpus)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property to insert the reference into.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<void>} Fulfilled - When the references have been inserted. Rejected - The error that caused the rejection.
 */
export async function insertReference(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }

        const { suppressAuth, consistentRead } = options || {};
        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne(
            { _id: itemId },
            { $push: { [propertyName]: { $each: references } }, $currentDate: { _updatedDate: new Date() } },
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (acknowledged) {
            if (modifiedCount <= 0) {
                throw Error(`WeivData - Operation is not succeed! Modified item count: ${modifiedCount}`)
            }
        } else {
            throw Error(`Error when inserting a reference item into an item, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`Error when inserting a reference item into an item: ${err}`);
    }
}