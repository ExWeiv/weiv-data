"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const lodash_1 = require("lodash");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
/**
 * Updates an item in a collection.
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
 * const result = await weivData.update("Clusters/IST12", updatedVersion, options)
 * console.log(result);
 * ```
 *
 * @param collectionId The ID of the collection that contains the item to update.
 * @param item The item to update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item>} Fulfilled - The object that was updated. Rejected - The error that caused the rejection.
 */
async function update(collectionId, item, options) {
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
            editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                throw Error(`WeivData - beforeUpdate Hook Failure ${err}`);
            });
        }
        const itemId = !editedItem ? (0, item_helpers_1.convertStringId)(item._id) : (0, item_helpers_1.convertStringId)(editedItem._id);
        const updateItem = (0, lodash_1.merge)(!editedItem ? item : editedItem, defaultValues);
        delete updateItem._id;
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { ok, value, lastErrorObject } = await collection.findOneAndUpdate({ _id: itemId }, { $set: updateItem }, { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (ok === 1 && value) {
            if (suppressHooks != true) {
                let editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [value, context]).catch((err) => {
                    throw Error(`WeivData - afterUpdate Hook Failure ${err}`);
                });
                if (editedResult) {
                    return editedResult;
                }
            }
            return value;
        }
        else {
            throw Error(`WeivData - Error when updating an item, acknowledged: ${lastErrorObject}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when updating an item: ${err}`);
    }
}
exports.update = update;
