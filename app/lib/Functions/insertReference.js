"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertReference = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const reference_helpers_1 = require("../Helpers/reference_helpers");
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
async function insertReference(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }
        const { suppressAuth, cleanupAfter, consistentRead } = options || {};
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne({ _id: itemId }, { $addToSet: { [propertyName]: { $each: references } }, $set: { _updatedDate: new Date() } }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged) {
            if (modifiedCount <= 0) {
                throw Error(`WeivData - Operation is not succeed! Modified item count: ${modifiedCount}`);
            }
        }
        else {
            throw Error(`Error when inserting a reference item into an item, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`Error when inserting a reference item into an item: ${err}`);
    }
}
exports.insertReference = insertReference;
