"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const mongodb_1 = require("mongodb");
const validator_1 = require("../Helpers/validator");
async function save(collectionId, item, options) {
    try {
        const { safeOptions, safeItem } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "save");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};
        let editedItem;
        if (safeItem._id && typeof safeItem._id === "string") {
            safeItem._id = (0, item_helpers_1.convertStringId)(safeItem._id);
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                    throw Error(`WeivData - beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        }
        else {
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [safeItem, context]).catch((err) => {
                    throw Error(`WeivData - beforeInsert (save) Hook Failure ${err}`);
                });
            }
        }
        editedItem = {
            ...safeItem,
            ...editedItem
        };
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { upsertedId, acknowledged } = await collection.updateOne(editedItem._id ? { _id: editedItem._id } : { _id: new mongodb_1.ObjectId() }, { $set: { ...editedItem, _updatedDate: new Date() }, $setOnInsert: !editedItem._createdDate ? { _createdDate: new Date() } : {} }, { readConcern: readConcern ? readConcern : "local", upsert: true });
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
