"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
async function update(collectionId, item, options) {
    try {
        const { safeItem, safeOptions } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "update");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};
        let editedItem;
        if (suppressHooks != true) {
            editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                throw new Error(`beforeUpdate Hook Failure ${err}`);
            });
        }
        const itemId = !editedItem ? (0, item_helpers_1.convertStringId)(safeItem._id) : (0, item_helpers_1.convertStringId)(editedItem._id);
        const updateItem = !editedItem ? safeItem : editedItem;
        delete updateItem._id;
        const filter = { _id: itemId };
        if (onlyOwner) {
            const currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const value = await collection.findOneAndUpdate(filter, { $set: { ...updateItem, _updatedDate: new Date() } }, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (value) {
            if (suppressHooks != true) {
                let editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [value, context]).catch((err) => {
                    throw new Error(`afterUpdate Hook Failure ${err}`);
                });
                if (editedResult) {
                    if (editedResult._id) {
                        editedResult._id = (0, item_helpers_1.convertObjectId)(editedResult._id);
                    }
                    return editedResult;
                }
            }
            if (value._id) {
                return {
                    ...value,
                    _id: (0, item_helpers_1.convertObjectId)(value._id)
                };
            }
            else {
                return value;
            }
        }
        else {
            throw new Error(`returned value has problem value: ${value}`);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when updating an item: ${err}`);
    }
}
exports.update = update;
