"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
async function remove(collectionId, itemId, options) {
    try {
        const { safeItemId, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, options }, ["collectionId", "itemId"], "remove");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};
        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeRemove", [safeItemId, context]).catch((err) => {
                throw new Error(`beforeRemove Hook Failure ${err}`);
            });
        }
        let newItemId = safeItemId;
        if (editedItemId) {
            newItemId = (0, item_helpers_1.convertStringId)(editedItemId);
        }
        const filter = { _id: newItemId };
        if (onlyOwner) {
            const currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndDelete(filter, { readConcern, includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, 'afterRemove', [item, context]).catch((err) => {
                    throw new Error(`afterRemove Hook Failure ${err}`);
                });
                if (editedItem) {
                    return editedItem;
                }
            }
            return item;
        }
        else {
            return null;
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when removing an item from collection: ${err}`);
    }
}
exports.remove = remove;
