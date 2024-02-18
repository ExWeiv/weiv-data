"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndRemove = void 0;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const item_helpers_1 = require("../../Helpers/item_helpers");
async function getAndRemove(collectionId, itemId, options) {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};
        let editedItemId = itemId;
        if (suppressHooks != true) {
            const modifiedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGetAndRemove", [itemId, context]).catch((err) => {
                throw Error(`WeivData - beforeGetAndRemove Hook Failure ${err}`);
            });
            if (modifiedItemId) {
                editedItemId = modifiedItemId;
            }
        }
        editedItemId = (0, item_helpers_1.convertStringId)(editedItemId);
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndDelete({ _id: editedItemId }, { readConcern: consistentRead === true ? "majority" : "local", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterGetAndRemove", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGetAndRemove Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when removing an item from collection (getAndRemove): ${err}`);
    }
}
exports.getAndRemove = getAndRemove;
