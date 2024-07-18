"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndUpdate = getAndUpdate;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const validator_1 = require("../../Helpers/validator");
const member_id_helpers_1 = require("../../Helpers/member_id_helpers");
const error_manager_1 = require("../../Errors/error_manager");
const internal_id_converter_1 = require("../../Helpers/internal_id_converter");
async function getAndUpdate(collectionId, itemId, value, options) {
    try {
        const { safeItemId, safeValue, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, value, options }, ["collectionId", "itemId", "value"], "getAndUpdate");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = safeOptions || {};
        let editedItem = safeValue;
        if (suppressHooks != true) {
            const modifiedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGetAndUpdate", [safeValue, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeGetAndUpdate Hook Failure ${err}`);
            });
            if (modifiedItem) {
                editedItem = modifiedItem;
            }
        }
        delete editedItem._id;
        const filter = { _id: safeItemId };
        if (onlyOwner) {
            const currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(filter, { $set: editedItem }, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterGetAndUpdate", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterGetAndUpdate Hook Failure ${err}`);
                });
                if (modifiedResult) {
                    return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(modifiedResult) : modifiedResult;
                }
            }
            return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item;
        }
        else {
            return undefined;
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when updating an item from collection (getAndUpdate): ${err}`);
    }
}
