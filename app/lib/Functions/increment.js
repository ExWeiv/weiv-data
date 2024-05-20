"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.increment = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const item_helpers_1 = require("../Helpers/item_helpers");
const validator_1 = require("../Helpers/validator");
async function increment(collectionId, itemId, propertyName, value, options) {
    try {
        const { safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "propertyName", "value"], "increment");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};
        let editedModify = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedParams = await (0, hook_manager_1.runDataHook)(collectionId, "beforeIncrement", [{ propertyName, value }, context]).catch((err) => {
                throw new Error(`beforeIncrement Hook Failure ${err}`);
            });
            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate({ _id: (0, item_helpers_1.convertStringId)(itemId) }, { $inc: { [editedModify.propertyName]: editedModify.value } }, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterIncrement", [item, context]).catch((err) => {
                    throw new Error(`afterIncrement Hook Failure ${err}`);
                });
                if (modifiedResult) {
                    return modifiedResult;
                }
            }
            return item;
        }
        else {
            return null;
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when incrementing a filed in an item: ${err}`);
    }
}
exports.increment = increment;
