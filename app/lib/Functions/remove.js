"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = remove;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const id_converters_1 = require("./id_converters");
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function remove(collectionId, itemId, options) {
    try {
        const { safeItemId, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, options }, ["collectionId", "itemId"], "remove");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeRemove", [safeItemId, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeRemove Hook Failure ${err}`);
            });
        }
        let newItemId = safeItemId;
        if (editedItemId) {
            newItemId = (0, id_converters_1.convertIdToObjectId)(editedItemId);
        }
        const filter = { _id: newItemId };
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
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, 'afterRemove', [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterRemove Hook Failure ${err}`);
                });
                if (editedItem) {
                    return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(editedItem) : editedItem;
                }
            }
            return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item;
        }
        else {
            return null;
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when removing an item from collection: ${err}`);
    }
}
