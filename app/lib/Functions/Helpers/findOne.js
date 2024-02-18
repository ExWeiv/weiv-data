"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOne = void 0;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
async function findOne(collectionId, propertyName, value, options) {
    try {
        if (!collectionId || !propertyName || !value) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, value`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};
        let editedFilter = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedFilter = await (0, hook_manager_1.runDataHook)(collectionId, "beforeFindOne", [{ propertyName, value }, context]).catch((err) => {
                throw Error(`WeivData - beforeFindOne Hook Failure ${err}`);
            });
            if (modifiedFilter) {
                editedFilter = modifiedFilter;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ [editedFilter.propertyName]: editedFilter.value }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterFindOne", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterFindOne Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when finding an item from collection (findOne): ${err}`);
    }
}
exports.findOne = findOne;
