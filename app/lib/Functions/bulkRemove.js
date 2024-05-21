"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRemove = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
async function bulkRemove(collectionId, itemIds, options) {
    try {
        const { safeItemIds, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemIds, options }, ["collectionId", "itemIds"], "bulkRemove");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};
        let currentMemberId;
        if (onlyOwner) {
            currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
        }
        let editedItemIds = safeItemIds.map(async (itemId) => {
            if (suppressHooks != true) {
                const editedId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                    throw new Error(`beforeRemove (bulkRemove) Hook Failure ${err}`);
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
        const writeOperations = editedItemIds.map((itemId) => {
            const filter = { _id: itemId };
            if (onlyOwner && currentMemberId) {
                filter._owner = currentMemberId;
            }
            return { deleteOne: { filter } };
        });
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { deletedCount, ok } = await collection.bulkWrite(writeOperations, { readConcern, ordered: true });
        if (ok) {
            return {
                removed: deletedCount,
                removedItemIds: editedItemIds
            };
        }
        else {
            throw new Error(`removed: ${deletedCount}, ok: ${ok}`);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}
exports.bulkRemove = bulkRemove;
