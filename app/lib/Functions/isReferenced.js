"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsReferencedCache = exports.isReferenced = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({
    checkperiod: 5,
    useClones: false,
    deleteOnExpire: true
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
        const totalCount = await collection.countDocuments({ _id: itemId, [propertyName]: { $in: references } }, { readConcern: readConcern ? readConcern : "local" });
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
        throw new Error(`WeivData - Error when checking if item is referenced: ${err}`);
    }
}
exports.isReferenced = isReferenced;
function getIsReferencedCache() {
    return cache;
}
exports.getIsReferencedCache = getIsReferencedCache;
