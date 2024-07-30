"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOne = findOne;
const connection_helpers_1 = require("../../Helpers/connection_helpers");
const hook_helpers_1 = require("../../Helpers/hook_helpers");
const hook_manager_1 = require("../../Hooks/hook_manager");
const validator_1 = require("../../Helpers/validator");
const error_manager_1 = require("../../Errors/error_manager");
const internal_id_converter_1 = require("../../Helpers/internal_id_converter");
const weiv_data_config_1 = require("../../Config/weiv_data_config");
async function findOne(collectionId, propertyName, value, options) {
    try {
        const { safeValue, safeOptions } = await (0, validator_1.validateParams)({ collectionId, propertyName, value, options }, ["collectionId", "propertyName", "value"], "findOne");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let editedFilter = { propertyName, value: safeValue };
        if (suppressHooks != true) {
            const modifiedFilter = await (0, hook_manager_1.runDataHook)(collectionId, "beforeFindOne", [{ propertyName, value: safeValue }, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeFindOne Hook Failure ${err}`);
            });
            if (modifiedFilter) {
                editedFilter = modifiedFilter;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ [editedFilter.propertyName]: editedFilter.value }, { readConcern });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterFindOne", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterFindOne Hook Failure ${err}`);
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
        (0, error_manager_1.kaptanLogar)("00016", `when finding an item from collection (findOne): ${err}`);
    }
}
