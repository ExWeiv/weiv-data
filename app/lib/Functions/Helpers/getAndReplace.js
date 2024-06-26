"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndReplace = void 0;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const validator_1 = require("../../Helpers/validator");
const member_id_helpers_1 = require("../../Helpers/member_id_helpers");
const item_helpers_1 = require("../../Helpers/item_helpers");
async function getAndReplace(collectionId, itemId, value, options) {
    try {
        const { safeItemId, safeValue, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, value, options }, ["collectionId", "itemId", "value"], "getAndReplace");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};
        let editedItem = safeValue;
        if (suppressHooks != true) {
            const modifiedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGetAndReplace", [safeValue, context]).catch((err) => {
                throw new Error(`beforeGetAndReplace Hook Failure ${err}`);
            });
            if (modifiedItem) {
                editedItem = modifiedItem;
            }
        }
        delete editedItem._id;
        const filter = { _id: safeItemId };
        if (onlyOwner) {
            const currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndReplace(filter, editedItem, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterGetAndReplace", [item, context]).catch((err) => {
                    throw new Error(`afterGetAndReplace Hook Failure ${err}`);
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
        throw new Error(`WeivData - Error when replacing an item from collection (getAndReplace): ${err}`);
    }
}
exports.getAndReplace = getAndReplace;
