"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({
    stdTTL: 30,
    checkperiod: 5,
    useClones: true,
    deleteOnExpire: true
});
async function get(collectionId, itemId, options) {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }
        const cacheKey = `${collectionId}-${itemId}-${options ? JSON.stringify(options) : "{}"}`;
        const cachedItem = cache.get(cacheKey);
        if (cachedItem) {
            return cachedItem;
        }
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        const newItemId = (0, item_helpers_1.convertStringId)(itemId);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (item) {
            cache.set(`${collectionId}-${itemId}-${options ? JSON.stringify(options) : "{}"}`, item);
            return item;
        }
        else {
            throw Error(`WeivData - Error when trying to get item from the collectin by itemId, itemId: ${newItemId}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when trying to get item from the collectin by itemId: ${err}`);
    }
}
exports.get = get;
