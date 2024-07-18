"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiply = multiply;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const id_converters_1 = require("./id_converters");
async function multiply(collectionId, itemId, propertyName, value, options) {
    try {
        const { safeOptions } = await (0, validator_1.validateParams)({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "value", "propertyName"], "multiply");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = safeOptions || {};
        let editedModify = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedParams = await (0, hook_manager_1.runDataHook)(collectionId, "beforeMultiply", [{ propertyName, value }, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeMultiply Hook Failure ${err}`);
            });
            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate({ _id: (0, id_converters_1.convertIdToObjectId)(itemId) }, { $mul: { [editedModify.propertyName]: editedModify.value } }, { readConcern, returnDocument: "after", includeResultMetadata: false });
        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterMultiply", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterMultiply Hook Failure ${err}`);
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
        (0, error_manager_1.kaptanLogar)("00016", `when multiplying a filed in an item: ${err}`);
    }
}
