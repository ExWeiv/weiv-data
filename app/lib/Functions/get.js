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
    checkperiod: 5,
    useClones: false,
    deleteOnExpire: true
});
async function get(collectionId, itemId, options) {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, enableCache, cacheTimeout } = options || {};
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
        if (enableCache) {
            const cacheKey = `${collectionId}-${itemId}-${options ? JSON.stringify(options) : "{}"}`;
            const cachedItem = cache.get(cacheKey);
            if (cachedItem && !editedItemId) {
                return cachedItem;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId }, { readConcern: readConcern ? readConcern : "local" });
        if (item) {
            if (suppressHooks != true) {
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, 'afterGet', [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGet Hook Failure ${err}`);
                });
                if (editedItem) {
                    return editedItem;
                }
            }
            if (enableCache) {
                cache.set(`${collectionId}-${itemId}-${options ? JSON.stringify(options) : "{}"}`, item, cacheTimeout || 15);
            }
            return item;
        }
        else {
            return null;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when trying to get item from the collectin by itemId: ${err}`);
    }
}
exports.get = get;
function getGetCache() {
    return cache;
}
exports.getGetCache = getGetCache;
