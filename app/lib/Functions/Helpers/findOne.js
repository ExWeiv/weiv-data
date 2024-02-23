"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOne = void 0;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({
    checkperiod: 5,
    useClones: false,
    deleteOnExpire: true
});
async function findOne(collectionId, propertyName, value, options) {
    try {
        if (!collectionId || !propertyName || !value) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, value`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, enableCache, cacheTimeout } = options || {};
        let editedFilter = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedFilter = await (0, hook_manager_1.runDataHook)(collectionId, "beforeFindOne", [{ propertyName, value }, context]).catch((err) => {
                throw Error(`WeivData - beforeFindOne Hook Failure ${err}`);
            });
            if (modifiedFilter) {
                editedFilter = modifiedFilter;
            }
        }
        if (enableCache) {
            const cacheKey = `${collectionId}-${editedFilter.propertyName}-${editedFilter.value ? JSON.stringify(editedFilter.value) : "{}"}`;
            const cachedItem = cache.get(cacheKey);
            if (cachedItem) {
                return cachedItem;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ [editedFilter.propertyName]: editedFilter.value }, { readConcern: readConcern ? readConcern : "local" });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterFindOne", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterFindOne Hook Failure ${err}`);
                });
                if (modifiedResult) {
                    return modifiedResult;
                }
            }
            if (enableCache) {
                cache.set(`${collectionId}-${editedFilter.propertyName}-${editedFilter.value ? JSON.stringify(editedFilter.value) : "{}"}`, item, cacheTimeout || 15);
            }
            return item;
        }
        else {
            return undefined;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when finding an item from collection (findOne): ${err}`);
    }
}
exports.findOne = findOne;
