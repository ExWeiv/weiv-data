"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRemove = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
async function bulkRemove(collectionId, itemIds, options) {
    try {
        if (!collectionId || !itemIds) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemIds`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};
        let editedItemIds = itemIds.map(async (itemId) => {
            if (suppressHooks != true) {
                const editedId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                    throw Error(`WeivData - beforeRemove (bulkRemove) Hook Failure ${err}`);
                });
                if (editedId) {
                    return (0, item_helpers_1.convertStringId)(editedId);
                }
                else {
                    return (0, item_helpers_1.convertStringId)(itemId);
                }
            }
            else {
                return (0, item_helpers_1.convertStringId)(itemId);
            }
        });
        editedItemIds = await Promise.all(editedItemIds);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, deletedCount } = await collection.deleteMany({ _id: { $in: editedItemIds } }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged === true) {
            return {
                removed: deletedCount,
                removedItemIds: editedItemIds
            };
        }
        else {
            throw Error(`WeivData - Error when removing items using bulkRemove, acknowledged: ${acknowledged}, deletedCount: ${deletedCount}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}
exports.bulkRemove = bulkRemove;
