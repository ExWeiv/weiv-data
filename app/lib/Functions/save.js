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
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function save(collectionId, item, options) {
    try {
        const { safeOptions, safeItem } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "save");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, enableVisitorId, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let actionType = "insert";
        let editedItem;
        if (safeItem._id) {
            safeItem._id = (0, id_converters_1.convertIdToObjectId)(safeItem._id);
            actionType = "update";
            if (suppressHooks != true) {
                editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00002", `beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        }
        else {
            safeItem._owner = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
            actionType = "insert";
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
        const filter = safeItem._id ? { _id: safeItem._id } : { _id: new mongodb_1.ObjectId() };
        if (onlyOwner) {
            const currentMemberId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const returnedItem = await collection.findOneAndUpdate(filter, { $set: { ...editedItem, _updatedDate: new Date() }, $setOnInsert: !editedItem._createdDate ? { _createdDate: new Date() } : {} }, { readConcern, upsert: true, returnDocument: "after" });
        if (returnedItem) {
            if (actionType === "insert") {
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(returnedItem) : returnedItem, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterInsert Hook Failure ${err}`);
                });
                if (editedResult) {
                    return convertIds ? { item: (0, internal_id_converter_1.convertDocumentIDs)(editedResult), upsertedId: editedResult._id } : { item: editedResult, upsertedId: editedResult._id };
                }
                else {
                    return convertIds ? { item: (0, internal_id_converter_1.convertDocumentIDs)(returnedItem), upsertedId: returnedItem._id } : { item: returnedItem, upsertedId: returnedItem._id };
                }
            }
            else if (actionType === "update") {
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
            else {
                (0, error_manager_1.kaptanLogar)("00016", `this error is not expected, try again or create a issue in WeivData GitHub repo`);
            }
        }
        else {
            (0, error_manager_1.kaptanLogar)("00016", `couldn't save item, this error is unexpected`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when saving an item to collection: ${err}`);
    }
}
