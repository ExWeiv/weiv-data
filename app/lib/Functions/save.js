"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const mongodb_1 = require("mongodb");
/**
 * Inserts or updates an item in a collection.
 *
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 *
 * // An item/object for save operation
 * const item = {
 *  location: "Riva 7",
 *  _id: "...", // Item id (optional)
 *  availableCPUs: ["M1", "A7", "R1"]
 * }
 *
 * const result = await weivData.save("Clusters/Riva", itemData)
 * console.log(result);
 * ```
 *
 * @param collectionId The ID of the collection to save the item to.
 * @param item The item to insert or update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<WeivDataSaveResult>} Fulfilled - The item that was either inserted or updated, depending on whether it previously existed in the collection. Rejected - The error that caused the rejection.
 */
async function save(collectionId, item, options) {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};
        // Convert ID to ObjectId if exist
        let editedItem;
        if (item._id && typeof item._id === "string") {
            item._id = (0, item_helpers_1.convertStringId)(item._id);
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        }
        else {
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeInsert (save) Hook Failure ${err}`);
                });
            }
        }
        editedItem = {
            ...item,
            ...editedItem
        };
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { upsertedId, acknowledged } = await collection.updateOne(editedItem._id ? { _id: editedItem._id } : { _id: new mongodb_1.ObjectId() }, { $set: editedItem, $currentDate: { _updatedDate: new Date() }, $setOnInsert: { _createdDate: new Date() } }, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });
        const returnedItem = { ...editedItem, _id: editedItem._id };
        if (acknowledged) {
            // Hooks handling
            if (upsertedId) {
                // Item Inserted
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [returnedItem, context]).catch((err) => {
                    throw Error(`WeivData - afterInsert Hook Failure ${err}`);
                });
                if (editedResult) {
                    return { item: editedResult, upsertedId };
                }
                else {
                    return { item: returnedItem, upsertedId };
                }
            }
            else {
                // Item Updated
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [returnedItem, context]).catch((err) => {
                    throw Error(`WeivData - afterUpdate Hook Failure ${err}`);
                });
                if (editedResult) {
                    return { item: editedResult };
                }
                else {
                    return { item: returnedItem };
                }
            }
        }
        else {
            throw Error(`WeivData - Error when saving an item to collection, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when saving an item to collection: ${err}`);
    }
}
exports.save = save;
