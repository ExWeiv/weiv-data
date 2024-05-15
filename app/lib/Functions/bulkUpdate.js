"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdate = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
async function bulkUpdate(collectionId, items, options) {
    try {
        const { safeItems, safeOptions } = await (0, validator_1.validateParams)({ collectionId, items, options }, ["collectionId", "items"], "bulkUpdate");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};
        let editedItems = safeItems.map(async (item) => {
            item._id = (0, item_helpers_1.convertStringId)(item._id);
            if (suppressHooks != true) {
                const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                    throw new Error(`beforeUpdate (bulkUpdate) Hook Failure ${err}`);
                });
                if (editedItem) {
                    return editedItem;
                }
                else {
                    return item;
                }
            }
            else {
                return item;
            }
        });
        editedItems = await Promise.all(editedItems);
        const bulkOperations = editedItems.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { ...item, _updatedDate: new Date() } }
                }
            };
        });
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { modifiedCount, ok } = await collection.bulkWrite(bulkOperations, { readConcern: readConcern ? readConcern : "local", ordered: true });
        if (ok) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [item, context]).catch((err) => {
                        throw new Error(`afterUpdate (bulkUpdate) Hook Failure ${err}`);
                    });
                    if (editedItem) {
                        return editedItem;
                    }
                    else {
                        return item;
                    }
                });
                editedItems = await Promise.all(editedItems);
            }
            return {
                updated: modifiedCount,
                updatedItems: editedItems
            };
        }
        else {
            throw new Error(`updated: ${modifiedCount}, ok: ${ok}`);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when updating items using bulkUpdate: ${err}`);
    }
}
exports.bulkUpdate = bulkUpdate;
