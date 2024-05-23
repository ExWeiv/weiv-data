"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const mongodb_1 = require("mongodb");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
async function save(collectionId, item, options) {
    try {
        const { safeOptions, safeItem } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "save");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, enableVisitorId } = safeOptions || {};
        let editedItem;
        if (safeItem._id && typeof safeItem._id === "string") {
            safeItem._id = (0, item_helpers_1.convertStringId)(safeItem._id);
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                    throw new Error(`beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        }
        else {
            safeItem._owner = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [safeItem, context]).catch((err) => {
                    throw new Error(`beforeInsert (save) Hook Failure ${err}`);
                });
            }
        }
        editedItem = {
            ...safeItem,
            ...editedItem
        };
        let filter;
        if (safeItem._id && typeof safeItem._id === "string" && onlyOwner) {
            filter = { _id: editedItem._id };
            const currentMemberId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { upsertedId, acknowledged } = await collection.updateOne(filter ? filter : { _id: new mongodb_1.ObjectId() }, { $set: { ...editedItem, _updatedDate: new Date() }, $setOnInsert: !editedItem._createdDate ? { _createdDate: new Date() } : {} }, { readConcern, upsert: true });
        const returnedItem = { ...editedItem, _id: editedItem._id };
        if (acknowledged) {
            if (upsertedId) {
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [returnedItem, context]).catch((err) => {
                    throw new Error(`afterInsert Hook Failure ${err}`);
                });
                if (editedResult) {
                    if (editedResult._id) {
                        editedResult._id = (0, item_helpers_1.convertObjectId)(editedResult._id);
                    }
                    return { item: editedResult, upsertedId };
                }
                else {
                    if (returnedItem._id) {
                        returnedItem._id = (0, item_helpers_1.convertObjectId)(returnedItem._id);
                    }
                    return { item: returnedItem, upsertedId };
                }
            }
            else {
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [returnedItem, context]).catch((err) => {
                    throw new Error(`afterUpdate Hook Failure ${err}`);
                });
                if (editedResult) {
                    if (editedResult._id) {
                        editedResult._id = (0, item_helpers_1.convertObjectId)(editedResult._id);
                    }
                    return { item: editedResult };
                }
                else {
                    if (returnedItem._id) {
                        returnedItem._id = (0, item_helpers_1.convertObjectId)(returnedItem._id);
                    }
                    return { item: returnedItem };
                }
            }
        }
        else {
            throw new Error(`acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when saving an item to collection: ${err}`);
    }
}
exports.save = save;
