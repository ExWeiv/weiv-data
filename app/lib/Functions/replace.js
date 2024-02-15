"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replace = void 0;
const lodash_1 = require("lodash");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const mongodb_1 = require("mongodb");
/**
 * Replaces and item in a collection. The item you passed with `item` param will take the place of existing data/document in your collection.
 *
 * This function has it's own hooks _beforeUpdate_ and _afterUpdate_ is not used here instead _beforeReplace_ and _afterReplace_ is used.
 *
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 *
 * // An item with an id
 * const updatedVersion = {...}
 * // Options for the operation
 * const options = {suppressHooks: true};
 *
 * const result = await weivData.replace("Clusters/IST57", updatedVersion, options)
 * console.log(result);
 * ```
 *
 * @param collectionId The ID of the collection that contains the item to replace.
 * @param item The item to replace.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item>} Fulfilled - The object that was replaced. Rejected - The error that caused the rejection.
 */
async function replace(collectionId, item, options) {
    try {
        if (!collectionId || !item._id) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item._id`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        const defaultValues = {
            _updatedDate: new Date()
        };
        let editedItem;
        if (suppressHooks != true) {
            editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeReplace", [item, context]).catch((err) => {
                throw Error(`WeivData - beforeReplace Hook Failure ${err}`);
            });
        }
        const itemId = !editedItem ? (0, item_helpers_1.convertStringId)(item._id) : (0, item_helpers_1.convertStringId)(editedItem._id);
        const replaceItem = (0, lodash_1.merge)(!editedItem ? item : defaultValues, editedItem);
        const filter = !itemId ? { _id: new mongodb_1.ObjectId() } : { _id: itemId };
        delete replaceItem._id;
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { ok, value, lastErrorObject } = await collection.findOneAndReplace(filter, { $set: replaceItem }, { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (ok === 1 && value) {
            if (suppressHooks != true) {
                let editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterReplace", [value, context]).catch((err) => {
                    throw Error(`WeivData - afterReplace Hook Failure ${err}`);
                });
                if (editedResult) {
                    return editedResult;
                }
            }
            return value;
        }
        else {
            throw Error(`WeivData - Error when replacing an item, acknowledged: ${lastErrorObject}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when replacing an item: ${err}`);
    }
}
exports.replace = replace;
