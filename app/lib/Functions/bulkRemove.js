"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRemove = bulkRemove;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const id_converters_1 = require("./id_converters");
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function bulkRemove(collectionId, itemIds, options) {
    try {
        const { safeItemIds, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemIds, options }, ["collectionId", "itemIds"], "bulkRemove");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let currentMemberId;
        if (onlyOwner) {
            currentMemberId = await (0, member_id_helpers_1.getOwnerId)();
        }
        let editedItemIds = safeItemIds.map(async (itemId) => {
            if (suppressHooks != true) {
                const editedId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00002", `beforeRemove (bulkRemove) Hook Failure ${err}`);
                });
                if (editedId) {
                    return editedId;
                }
                else {
                    return itemId;
                }
            }
            else {
                return itemId;
            }
        });
        editedItemIds = await Promise.all(editedItemIds);
        const writeOperations = editedItemIds.map((itemId) => {
            const filter = { _id: (0, id_converters_1.convertIdToObjectId)(itemId) };
            if (onlyOwner && currentMemberId) {
                filter._owner = currentMemberId;
            }
            return { deleteOne: { filter } };
        });
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { deletedCount, ok } = await collection.bulkWrite(writeOperations, { readConcern, ordered: true });
        if (ok) {
            return {
                removed: deletedCount,
                removedItemIds: convertIds ? editedItemIds.map(id => (0, internal_id_converter_1.convertToStringId)(id)) : editedItemIds
            };
        }
        else {
            (0, error_manager_1.kaptanLogar)("00016", `one or more items failed to be deleted`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when removing items using bulkRemove: ${err}`);
    }
}
