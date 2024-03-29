import type { CollectionID, WeivDataOptionsCache } from '../Helpers/collection';
import { connectionHandler } from '../Helpers/connection_helpers';
import { type ReferencedItem, type ReferringItem, getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import { isArray } from 'lodash';
import NodeCache from "node-cache";

const cache = new NodeCache({
    checkperiod: 5,
    useClones: false,
    deleteOnExpire: true
})

/**
 * Checks if a reference to the referenced item exists in the specified property of the referring item.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // Item id
 * const itemId = "..."
 * 
 * // References to be checked if exists. `ItemId[]`
 * const cpus = ["cpuId1"]
 * 
 * const result = await weivData.isReferenced("Clusters/Ortakoy", "availableCPUs", itemId, cpus);
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property that possibly contains the references to the referenced item.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item or referenced item's ID.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<boolean>} Fulfilled - Whether the referring item contains a reference to the referenced item or not. Rejected - The error that caused the rejection.
 */
export async function isReferenced(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptionsCache): Promise<boolean> {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }

        if (isArray(referencedItem)) {
            throw Error(`WeivData - Wrong item type for referencedItem, it shouldn't be an array`);
        }

        const { suppressAuth, readConcern, enableCache, cacheTimeout } = options || {};

        const cacheKey = `${collectionId}-${propertyName}-${referringItem}-${referencedItem}-${options ? JSON.stringify(options) : "{}"}`;
        if (enableCache) {
            const cachedItem = cache.get<boolean>(cacheKey);
            if (cachedItem) {
                return cachedItem;
            }
        }

        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const totalCount = await collection.countDocuments(
            { _id: itemId, [propertyName]: { $in: references } },
            { readConcern: readConcern ? readConcern : "local" }
        );

        if (totalCount > 0) {
            if (enableCache) {
                cache.set(cacheKey, true, cacheTimeout || 15);
            }
            return true;
        } else {
            if (enableCache) {
                cache.set(cacheKey, false, cacheTimeout || 15);
            }
            return false;
        }
    } catch (err) {
        throw Error(`WeivData - Error when checking if item is referenced: ${err}`);
    }
}

/**@internal */
export function getIsReferencedCache() {
    return cache;
}