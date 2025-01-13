import type { CollectionID, WeivDataOptionsCache, ReferringItem, ReferencedItem } from '@exweiv/weiv-data';
import { connectionHandler } from '../Helpers/connection_helpers';
import { validateParams } from '../Helpers/validator';
import { CacheableMemory } from 'cacheable';
import { kaptanLogar } from '../Errors/error_manager';

const cache = new CacheableMemory({
    checkInterval: 5000,
    useClone: false,
    ttl: 10 * 1000
});

export async function isReferenced(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptionsCache): Promise<boolean> {
    try {
        const { safeReferencedItemIds, safeReferringItemId, safeOptions } = await validateParams<"isReferenced">(
            { collectionId, propertyName, referencedItem, referringItem, options },
            ["collectionId", "propertyName", "referringItem", "referencedItem"],
            "isReferenced"
        );

        const { suppressAuth, readConcern, enableCache, cacheTimeout } = safeOptions || {};
        const cacheKey = `${collectionId}-${propertyName}-${referringItem}-${referencedItem}-${options ? JSON.stringify(options) : "{}"}`;
        if (enableCache) {
            const cachedItem = cache.get<boolean>(cacheKey);
            if (cachedItem) {
                return cachedItem;
            }
        }

        const references = safeReferencedItemIds;
        const itemId = safeReferringItemId;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const totalCount = await collection.countDocuments(
            { _id: itemId, [propertyName]: { $in: references } },
            { readConcern }
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
        kaptanLogar("00017", `when checking if item is referenced: ${err}`);
    }
}

/**@internal */
export function getIsReferencedCache() {
    return cache;
}