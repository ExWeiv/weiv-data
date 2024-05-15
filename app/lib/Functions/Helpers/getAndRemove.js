"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndRemove = void 0;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const item_helpers_1 = require("../../Helpers/item_helpers");
const validator_1 = require("../../Helpers/validator");
async function getAndRemove(collectionId, itemId, options) {
    try {
        const { safeItemId, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, options }, ["collectionId", "itemId"], "getAndRemove");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};
        let editedItemId = safeItemId;
        if (suppressHooks != true) {
            const modifiedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGetAndRemove", [safeItemId, context]).catch((err) => {
                throw new Error(`beforeGetAndRemove Hook Failure ${err}`);
            });
            if (modifiedItemId) {
                editedItemId = (0, item_helpers_1.convertStringId)(modifiedItemId);
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndDelete({ _id: editedItemId }, { readConcern: readConcern ? readConcern : "local", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterGetAndRemove", [item, context]).catch((err) => {
                    throw new Error(`afterGetAndRemove Hook Failure ${err}`);
                });
                if (modifiedResult) {
                    return modifiedResult;
                }
            }
            return item;
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
