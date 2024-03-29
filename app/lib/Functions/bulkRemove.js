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
        const { suppressAuth, suppressHooks, readConcern } = options || {};
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
        const writeOperations = await editedItemIds.map((itemId) => {
            return {
                deleteOne: {
                    filter: { _id: itemId },
                }
            };
        });
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { deletedCount, ok } = await collection.bulkWrite(writeOperations, { readConcern: readConcern ? readConcern : "local", ordered: true });
        if (ok) {
            return {
                removed: deletedCount,
                removedItemIds: editedItemIds
            };
        }
        else {
            throw Error(`WeivData - Error when removing items using bulkRemove: removed: ${deletedCount}, ok: ${ok}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}
exports.bulkRemove = bulkRemove;
