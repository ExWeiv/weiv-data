"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReferenced = isReferenced;
exports.getIsReferencedCache = getIsReferencedCache;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
const cacheable_1 = require("cacheable");
const error_manager_1 = require("../Errors/error_manager");
const cache = new cacheable_1.CacheableMemory({
    checkInterval: 5000,
    useClone: false,
    ttl: 10 * 1000
});
async function isReferenced(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        const { safeReferencedItemIds, safeReferringItemId, safeOptions } = await (0, validator_1.validateParams)({ collectionId, propertyName, referencedItem, referringItem, options }, ["collectionId", "propertyName", "referringItem", "referencedItem"], "isReferenced");
        const { suppressAuth, readConcern, enableCache, cacheTimeout } = safeOptions || {};
        const cacheKey = `${collectionId}-${propertyName}-${referringItem}-${referencedItem}-${options ? JSON.stringify(options) : "{}"}`;
        if (enableCache) {
            const cachedItem = cache.get(cacheKey);
            if (cachedItem) {
                return cachedItem;
            }
        }
        const references = safeReferencedItemIds;
        const itemId = safeReferringItemId;
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const totalCount = await collection.countDocuments({ _id: itemId, [propertyName]: { $in: references } }, { readConcern });
        if (totalCount > 0) {
            if (enableCache) {
                cache.set(cacheKey, true, cacheTimeout || 15);
            }
            return true;
        }
        else {
            if (enableCache) {
                cache.set(cacheKey, false, cacheTimeout || 15);
            }
            return false;
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00017", `when checking if item is referenced: ${err}`);
    }
}
function getIsReferencedCache() {
    return cache;
}
