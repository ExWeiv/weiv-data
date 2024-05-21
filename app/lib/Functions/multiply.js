"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiply = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const item_helpers_1 = require("../Helpers/item_helpers");
const validator_1 = require("../Helpers/validator");
async function multiply(collectionId, itemId, propertyName, value, options) {
    try {
        const { safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "value", "propertyName"], "multiply");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};
        let editedModify = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedParams = await (0, hook_manager_1.runDataHook)(collectionId, "beforeMultiply", [{ propertyName, value }, context]).catch((err) => {
                throw new Error(`beforeMultiply Hook Failure ${err}`);
            });
            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate({ _id: (0, item_helpers_1.convertStringId)(itemId) }, { $mul: { [editedModify.propertyName]: editedModify.value } }, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterMultiply", [item, context]).catch((err) => {
                    throw new Error(`afterMultiply Hook Failure ${err}`);
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
            return null;
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when multiplying a filed in an item: ${err}`);
    }
}
exports.multiply = multiply;
