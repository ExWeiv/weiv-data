"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndReplace = getAndReplace;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const validator_1 = require("../../Helpers/validator");
const member_id_helpers_1 = require("../../Helpers/member_id_helpers");
const error_manager_1 = require("../../Errors/error_manager");
const internal_id_converter_1 = require("../../Helpers/internal_id_converter");
const weiv_data_config_1 = require("../../Config/weiv_data_config");
async function getAndReplace(collectionId, itemId, value, options) {
    try {
        const { safeItemId, safeValue, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, value, options }, ["collectionId", "itemId", "value"], "getAndReplace");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let editedItem = safeValue;
        if (suppressHooks != true) {
            const modifiedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGetAndReplace", [safeValue, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeGetAndReplace Hook Failure ${err}`);
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
        const item = await collection.findOneAndReplace(filter, editedItem, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterGetAndReplace", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterGetAndReplace Hook Failure ${err}`);
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
        (0, error_manager_1.kaptanLogar)("00016", `when replacing an item from collection (getAndReplace): ${err}`);
    }
}
