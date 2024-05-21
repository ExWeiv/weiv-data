"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdate = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
async function bulkUpdate(collectionId, items, options) {
    try {
        const { safeItems, safeOptions } = await (0, validator_1.validateParams)({ collectionId, items, options }, ["collectionId", "items"], "bulkUpdate");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};
        const currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
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
            const filter = { _id: item._id };
            if (onlyOwner) {
                if (currentMemberId) {
                    filter._owner = currentMemberId;
                }
            }
            return {
                updateOne: {
                    filter,
                    update: { $set: { ...item, _updatedDate: new Date() } }
                }
            };
        });
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { modifiedCount, ok } = await collection.bulkWrite(bulkOperations, { readConcern, ordered: true });
        if (ok) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    if (item._id) {
                        item._id = (0, item_helpers_1.convertObjectId)(item._id);
                    }
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
