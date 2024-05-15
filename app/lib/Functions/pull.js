"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const item_helpers_1 = require("../Helpers/item_helpers");
const validator_1 = require("../Helpers/validator");
async function pull(collectionId, itemId, propertyName, value, options) {
    try {
        const { safeValue, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "value", "propertyName"], "pull");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};
        let editedModify = { propertyName, value: safeValue };
        if (suppressHooks != true) {
            const modifiedParams = await (0, hook_manager_1.runDataHook)(collectionId, "beforePull", [{ propertyName, value: safeValue }, context]).catch((err) => {
                throw new Error(`beforePull Hook Failure ${err}`);
            });
            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate({ _id: (0, item_helpers_1.convertStringId)(itemId) }, { $pull: { [editedModify.propertyName]: editedModify.value } }, { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterPull", [item, context]).catch((err) => {
                    throw new Error(`afterPull Hook Failure ${err}`);
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
        throw new Error(`WeivData - Error when removıng (pullıng) value/s from an array filed in an item: ${err}`);
    }
}
exports.pull = pull;
