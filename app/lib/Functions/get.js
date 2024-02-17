"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGetCache = exports.get = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const node_cache_1 = __importDefault(require("node-cache"));
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const cache = new node_cache_1.default({
    stdTTL: 30,
    checkperiod: 5,
    useClones: true,
    deleteOnExpire: true
});
/**
 * Retrieves an item from a collection.
 *
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 *
 * // Item ID
 * const itemId = "..."
 *
 * const result = await weivData.get("Clusters/All", itemId)
 * console.log(result);
 * ```
 *
 * @param collectionId The ID of the collection to retrieve the item from.
 * @param itemId The ID of the item to retrieve.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | undefined>} Fulfilled - The retrieved item or null if not found. Rejected - The error that caused the rejection.
 */
async function get(collectionId, itemId, options) {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};
        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGet", [itemId, context]).catch((err) => {
                throw Error(`WeivData - beforeGet Hook Failure ${err}`);
            });
        }
        let newItemId;
        if (editedItemId) {
            newItemId = (0, item_helpers_1.convertStringId)(editedItemId);
        }
        else {
            newItemId = (0, item_helpers_1.convertStringId)(itemId);
        }
        const cacheKey = `${collectionId}-${itemId}-${options ? JSON.stringify(options) : "{}"}`;
        const cachedItem = cache.get(cacheKey);
        if (cachedItem && !editedItemId) {
            return cachedItem;
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (item) {
            if (suppressHooks != true) {
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, 'afterGet', [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGet Hook Failure ${err}`);
                });
                if (editedItem) {
                    return editedItem;
                }
            }
            cache.set(`${collectionId}-${itemId}-${options ? JSON.stringify(options) : "{}"}`, item);
            return item;
        }
        else {
            return undefined;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when trying to get item from the collectin by itemId: ${err}`);
    }
}
exports.get = get;
/**@internal */
function getGetCache() {
    return cache;
}
exports.getGetCache = getGetCache;
