"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const id_converters_1 = require("./id_converters");
async function update(collectionId, item, options) {
    try {
        const { safeItem, safeOptions } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "update");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = safeOptions || {};
        let editedItem;
        if (suppressHooks != true) {
            editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeUpdate Hook Failure ${err}`);
            });
        }
        const itemId = !editedItem ? (0, id_converters_1.convertIdToObjectId)(safeItem._id) : (0, id_converters_1.convertIdToObjectId)(editedItem._id);
        const updateItem = !editedItem ? safeItem : editedItem;
        delete updateItem._id;
        const filter = { _id: itemId };
        if (onlyOwner) {
            const currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const value = await collection.findOneAndUpdate(filter, { $set: { ...updateItem, _updatedDate: new Date() } }, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (value) {
            if (suppressHooks != true) {
                let editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(value) : value, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterUpdate Hook Failure ${err}`);
                });
                if (editedResult) {
                    return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(editedResult) : editedResult;
                }
            }
            return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(value) : value;
        }
        else {
            (0, error_manager_1.kaptanLogar)("00015", "item not found");
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00015", `${err}`);
    }
}
