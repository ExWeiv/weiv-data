"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceReferences = void 0;
const reference_helpers_1 = require("../Helpers/reference_helpers");
const update_1 = require("./update");
/**
 * Replaces current references with references in the specified property.
 *
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 *
 * // Item id
 * const itemId = "..."
 *
 * // New references
 * const cpus = ["cpuId1", "cpuId2", "cpuId3", ...]
 *
 * const result = await weivData.replaceReferences("Clusters/Ortakoy", "availableCPUs", itemId, cpus, {suppressAuth: true})
 * console.log(result);
 * ```
 *
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property to replaces the references in.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<void>} Fulfilled - When the references have been inserted. Rejected - The error that caused the rejection.
 */
async function replaceReferences(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const updated = await (0, update_1.update)(collectionId, { _id: itemId, [propertyName]: references }, options);
        if (!updated) {
            throw Error(`WeivData - Error when replacing references, result: ${updated}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when replacing references: ${err}`);
    }
}
exports.replaceReferences = replaceReferences;
