"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
/**
 * Removes an item from a collection.
 *
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 *
 * // ID of item that will be removed
 * const itemId = "..."
 *
 * const result = await weivData.remove("Clusters/Riva", itemId)
 * console.log(result);
 * ```
 *
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId The ID of the item to remove.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | null>} Fulfilled - The removed item, or null if the item was not found. Rejected - The error that caused the rejection.
 */
async function remove(collectionId, itemId, options) {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};
        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                throw Error(`WeivData - beforeRemove Hook Failure ${err}`);
            });
        }
        let newItemId;
        if (editedItemId) {
            newItemId = (0, item_helpers_1.convertStringId)(editedItemId);
        }
        else {
            newItemId = (0, item_helpers_1.convertStringId)(itemId);
        }
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { ok, value } = await collection.findOneAndDelete({ _id: newItemId }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (ok === 1) {
            if (suppressHooks != true) {
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, 'afterRemove', [value, context]).catch((err) => {
                    throw Error(`WeivData - afterRemove Hook Failure ${err}`);
                });
                if (editedItem) {
                    return editedItem;
                }
            }
            return value;
        }
        else {
            console.error(`WeivData - Error when removing an item from collection, ok: ${ok}`);
            return null;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when removing an item from collection: ${err}`);
    }
}
exports.remove = remove;
