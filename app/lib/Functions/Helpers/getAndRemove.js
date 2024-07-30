"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndRemove = getAndRemove;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const validator_1 = require("../../Helpers/validator");
const member_id_helpers_1 = require("../../Helpers/member_id_helpers");
const error_manager_1 = require("../../Errors/error_manager");
const internal_id_converter_1 = require("../../Helpers/internal_id_converter");
const id_converters_1 = require("../id_converters");
const weiv_data_config_1 = require("../../Config/weiv_data_config");
async function getAndRemove(collectionId, itemId, options) {
    try {
        const { safeItemId, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, options }, ["collectionId", "itemId"], "getAndRemove");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let editedItemId = safeItemId;
        if (suppressHooks != true) {
            const modifiedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGetAndRemove", [safeItemId, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeGetAndRemove Hook Failure ${err}`);
            });
            if (modifiedItemId) {
                editedItemId = (0, id_converters_1.convertIdToObjectId)(modifiedItemId);
            }
        }
        const filter = { _id: editedItemId };
        if (onlyOwner) {
            const currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndDelete(filter, { readConcern, includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterGetAndRemove", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterGetAndRemove Hook Failure ${err}`);
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
        (0, error_manager_1.kaptanLogar)("00016", `when removing an item from collection (getAndRemove): ${err}`);
    }
}
