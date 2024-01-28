import { connectionHandler } from '../Helpers/connection_helpers';
import { getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import { isArray } from 'lodash';
import NodeCache from "node-cache";

const cache = new NodeCache({
    stdTTL: 30,
    checkperiod: 5,
    useClones: true,
    deleteOnExpire: true
})

/**
 * @description Checks if a reference to the referenced item exists in the specified property of the referring item.
 * @param collectionId The ID of the collection that contains the referring item.
 * @param propertyName The property that possibly contains the references to the referenced item.
 * @param referringItem The referring item or referring item's ID.
 * @param referencedItem The referenced item or referenced item's ID.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - Whether the referring item contains a reference to the referenced item or not. Rejected - The error that caused the rejection.
 */
export async function isReferenced(collectionId: string, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItemSingle, options?: WeivDataOptions): Promise<boolean> {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }

        if (isArray(referencedItem)) {
            throw Error(`WeivData - Wrong item type for referencedItem, it shouldn't be an array`);
        }

        const cacheKey = `${collectionId}-${propertyName}-${referringItem}-${referencedItem}-${options ? JSON.stringify(options) : "{}"}`;
        const cachedItem = cache.get(cacheKey);
        if (cachedItem) {
            console.log("Cached Item Returned")
            return cachedItem;
        }


        const { suppressAuth, cleanupAfter, consistentRead } = options || { suppressAuth: false, cleanupAfter: false, consistentRead: false };
        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const totalCount = await collection.countDocuments({ _id: itemId, [propertyName]: { $in: references } }, { readConcern: consistentRead === true ? "majority" : "local" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (totalCount > 0) {
            cache.set(cacheKey, true);
            return true;
        } else {
            cache.set(cacheKey, false);
            return false;
        }
    } catch (err) {
        throw Error(`WeivData - Error when checking if item is referenced: ${err}`);
    }
}