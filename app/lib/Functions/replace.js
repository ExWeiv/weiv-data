"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replace = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const mongodb_1 = require("mongodb");
const validator_1 = require("../Helpers/validator");
async function replace(collectionId, item, options) {
    try {
        const { safeItem, safeOptions } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "replace");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};
        let editedItem;
        if (suppressHooks != true) {
            editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeReplace", [safeItem, context]).catch((err) => {
                throw Error(`WeivData - beforeReplace Hook Failure ${err}`);
            });
        }
        const itemId = !editedItem ? (0, item_helpers_1.convertStringId)(safeItem._id) : (0, item_helpers_1.convertStringId)(editedItem._id);
        const replaceItem = !editedItem ? safeItem : editedItem;
        const filter = !itemId ? { _id: new mongodb_1.ObjectId() } : { _id: itemId };
        delete replaceItem._id;
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const value = await collection.findOneAndReplace(filter, { $set: { ...replaceItem, _updatedDate: new Date() } }, { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false });
        if (value) {
            if (suppressHooks != true) {
                let editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterReplace", [value, context]).catch((err) => {
                    throw Error(`WeivData - afterReplace Hook Failure ${err}`);
                });
                if (editedResult) {
                    return editedResult;
                }
            }
            return value;
        }
        else {
            throw Error(`WeivData - Error when replacing an item, returned value: ${value}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when replacing an item: ${err}`);
    }
}
exports.replace = replace;
