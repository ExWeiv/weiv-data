"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
async function save(collectionId, item, options) {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};
        if (!item._createdDate) {
            item._createdDate = new Date();
        }
        item._updatedDate = new Date();
        let editedItem;
        if (item._id && typeof item._id === "string") {
            item._id = (0, item_helpers_1.convertStringId)(item._id);
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        }
        else {
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeInsert (save) Hook Failure ${err}`);
                });
            }
        }
        editedItem = {
            ...item,
            ...editedItem
        };
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const filter = editedItem._id ? { _id: editedItem._id } : {};
        const { upsertedId, acknowledged } = await collection.updateOne(filter, { $set: editedItem }, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });
        if (cleanupAfter === true) {
            await cleanup();
        }
        const returnedItem = { ...editedItem, _id: editedItem._id };
        if (acknowledged) {
            if (upsertedId) {
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [returnedItem, context]).catch((err) => {
                    throw Error(`WeivData - afterInsert Hook Failure ${err}`);
                });
                if (editedResult) {
                    return { item: editedResult, upsertedId };
                }
                else {
                    return { item: returnedItem, upsertedId };
                }
            }
            else {
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [returnedItem, context]).catch((err) => {
                    throw Error(`WeivData - afterUpdate Hook Failure ${err}`);
                });
                if (editedResult) {
                    return { item: editedResult };
                }
                else {
                    return { item: returnedItem };
                }
            }
        }
        else {
            throw Error(`WeivData - Error when saving an item to collection, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when saving an item to collection: ${err}`);
    }
}
exports.save = save;
