"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const id_converters_1 = require("./id_converters");
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function get(collectionId, itemId, options) {
    try {
        const { safeOptions, safeItemId } = await (0, validator_1.validateParams)({ collectionId, itemId, options }, ["collectionId", "itemId"], "get");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await (0, hook_manager_1.runDataHook)(collectionId, "beforeGet", [safeItemId, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeGet Hook Failure ${err}`);
            });
        }
        let newItemId = safeItemId;
        if (editedItemId) {
            newItemId = (0, id_converters_1.convertIdToObjectId)(editedItemId);
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId }, { readConcern });
        if (item) {
            if (suppressHooks != true) {
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, 'afterGet', [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterGet Hook Failure ${err}`);
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
        (0, error_manager_1.kaptanLogar)("00016", `when trying to get item from the collectin by itemId: ${err}`);
    }
}
