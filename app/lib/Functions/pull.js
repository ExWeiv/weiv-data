"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = pull;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const id_converters_1 = require("./id_converters");
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function pull(collectionId, itemId, propertyName, value, options) {
    try {
        const { safeValue, safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "value", "propertyName"], "pull");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let editedModify = { propertyName, value: safeValue };
        if (suppressHooks != true) {
            const modifiedParams = await (0, hook_manager_1.runDataHook)(collectionId, "beforePull", [{ propertyName, value: safeValue }, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforePull Hook Failure ${err}`);
            });
            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate({ _id: (0, id_converters_1.convertIdToObjectId)(itemId) }, { $pull: { [editedModify.propertyName]: editedModify.value } }, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterPull", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterPull Hook Failure ${err}`);
                });
                if (modifiedResult) {
                    return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(modifiedResult) : modifiedResult;
                }
            }
            return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item;
        }
        else {
            return null;
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when removıng (pullıng) value/s from an array filed in an item: ${err}`);
    }
}
