"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndRemove = void 0;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const item_helpers_1 = require("../../Helpers/item_helpers");
const validator_1 = require("../../Helpers/validator");
const member_id_helpers_1 = require("../../Helpers/member_id_helpers");
async function getAndRemove(collectionId, itemId, options) {
    try {
        const { safeItemId, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, options }, ["collectionId", "itemId"], "getAndRemove");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};
        let editedItemId = safeItemId;
        if (suppressHooks != true) {
            const modifiedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGetAndRemove", [safeItemId, context]).catch((err) => {
                throw new Error(`beforeGetAndRemove Hook Failure ${err}`);
            });
            if (modifiedItemId) {
                editedItemId = (0, item_helpers_1.convertStringId)(modifiedItemId);
            }
        }
        const filter = { _id: editedItemId };
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
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterGetAndRemove", [item, context]).catch((err) => {
                    throw new Error(`afterGetAndRemove Hook Failure ${err}`);
                });
                if (modifiedResult) {
                    if (modifiedResult._id) {
                        modifiedResult._id = (0, item_helpers_1.convertObjectId)(modifiedResult._id);
                    }
                    return modifiedResult;
                }
            }
            if (item._id) {
                return {
                    ...item,
                    _id: (0, item_helpers_1.convertObjectId)(item._id)
                };
            }
            else {
                return item;
            }
        }
        else {
            return undefined;
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when removing an item from collection (getAndRemove): ${err}`);
    }
}
exports.getAndRemove = getAndRemove;
