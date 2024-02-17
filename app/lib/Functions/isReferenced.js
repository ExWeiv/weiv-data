"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsReferencedCache = exports.isReferenced = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const reference_helpers_1 = require("../Helpers/reference_helpers");
const lodash_1 = require("lodash");
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({
    stdTTL: 30,
    checkperiod: 5,
    useClones: true,
    deleteOnExpire: true
});
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
async function isReferenced(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }
        if ((0, lodash_1.isArray)(referencedItem)) {
            throw Error(`WeivData - Wrong item type for referencedItem, it shouldn't be an array`);
        }
        const cacheKey = `${collectionId}-${propertyName}-${referringItem}-${referencedItem}-${options ? JSON.stringify(options) : "{}"}`;
        const cachedItem = cache.get(cacheKey);
        if (cachedItem) {
            return cachedItem;
        }
        const { suppressAuth, consistentRead } = options || {};
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const totalCount = await collection.countDocuments({ _id: itemId, [propertyName]: { $in: references } }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (totalCount > 0) {
            cache.set(cacheKey, true);
            return true;
        }
        else {
            cache.set(cacheKey, false);
            return false;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when checking if item is referenced: ${err}`);
    }
}
exports.isReferenced = isReferenced;
/**@internal */
function getIsReferencedCache() {
    return cache;
}
exports.getIsReferencedCache = getIsReferencedCache;
