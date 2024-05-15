"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
async function update(collectionId, item, options) {
    try {
        const { safeItem, safeOptions } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "update");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || { suppressAuth: false, suppressHooks: false };
        let editedItem;
        if (suppressHooks != true) {
            editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                throw new Error(`beforeUpdate Hook Failure ${err}`);
            });
        }
        const itemId = !editedItem ? (0, item_helpers_1.convertStringId)(safeItem._id) : (0, item_helpers_1.convertStringId)(editedItem._id);
        const updateItem = !editedItem ? safeItem : editedItem;
        delete updateItem._id;
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const value = await collection.findOneAndUpdate({ _id: itemId }, { $set: { ...updateItem, _updatedDate: new Date() } }, { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false });
        if (value) {
            if (suppressHooks != true) {
                let editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [value, context]).catch((err) => {
                    throw new Error(`afterUpdate Hook Failure ${err}`);
                });
                if (editedResult) {
                    return editedResult;
                }
            }
            return value;
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
