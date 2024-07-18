"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = save;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const mongodb_1 = require("mongodb");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const id_converters_1 = require("./id_converters");
async function save(collectionId, item, options) {
    try {
        const { safeOptions, safeItem } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "save");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, enableVisitorId, convertIds } = safeOptions || {};
        let editedItem;
        if (safeItem._id) {
            safeItem._id = (0, id_converters_1.convertIdToObjectId)(safeItem._id);
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00002", `beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        }
        else {
            safeItem._owner = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [safeItem, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00002", `beforeInsert (save) Hook Failure ${err}`);
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
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(returnedItem) : returnedItem, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterInsert Hook Failure ${err}`);
                });
                if (editedResult) {
                    return convertIds ? { item: (0, internal_id_converter_1.convertDocumentIDs)(editedResult) } : { item: editedResult };
                }
                else {
                    return convertIds ? { item: (0, internal_id_converter_1.convertDocumentIDs)(returnedItem) } : { item: returnedItem };
                }
            }
            else {
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(returnedItem) : returnedItem, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterUpdate Hook Failure ${err}`);
                });
                if (editedResult) {
                    return convertIds ? { item: (0, internal_id_converter_1.convertDocumentIDs)(editedResult) } : { item: editedResult };
                }
                else {
                    return convertIds ? { item: (0, internal_id_converter_1.convertDocumentIDs)(returnedItem) } : { item: returnedItem };
                }
            }
        }
        else {
            (0, error_manager_1.kaptanLogar)("00016", `acknowledged is not true for (save function)`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when saving an item to collection: ${err}`);
    }
}
