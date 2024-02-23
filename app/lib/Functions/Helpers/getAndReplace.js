"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndReplace = void 0;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const item_helpers_1 = require("../../Helpers/item_helpers");
async function getAndReplace(collectionId, itemId, value, options) {
    try {
        if (!collectionId || !itemId || !value) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId, value`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = options || {};
        let editedItem = value;
        if (suppressHooks != true) {
            const modifiedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGetAndReplace", [value, context]).catch((err) => {
                throw Error(`WeivData - beforeGetAndReplace Hook Failure ${err}`);
            });
            if (modifiedItem) {
                editedItem = modifiedItem;
            }
        }
        delete editedItem._id;
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndReplace({ _id: (0, item_helpers_1.convertStringId)(itemId) }, editedItem, { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterGetAndReplace", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGetAndReplace Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when replacing an item from collection (getAndReplace): ${err}`);
    }
}
exports.getAndReplace = getAndReplace;
