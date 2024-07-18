"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insert = insert;
const lodash_1 = require("lodash");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
async function insert(collectionId, item, options) {
    try {
        const { safeItem, safeOptions } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "insert");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern, convertIds } = safeOptions || {};
        const defaultValues = {
            _updatedDate: new Date(),
            _createdDate: new Date(),
        };
        defaultValues["_owner"] = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        const modifiedItem = (0, lodash_1.merge)(defaultValues, safeItem);
        let editedItem;
        if (suppressHooks != true) {
            editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [modifiedItem, context]).catch((err) => {
                (0, error_manager_1.kaptanLogar)("00002", `beforeInsert Hook Failure ${err}`);
            });
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedId, acknowledged } = await collection.insertOne(!editedItem ? modifiedItem : editedItem, { readConcern });
        if (acknowledged) {
            if (suppressHooks != true) {
                const item = {
                    ...!editedItem ? modifiedItem : editedItem,
                    _id: convertIds ? (0, internal_id_converter_1.convertToStringId)(insertedId) : insertedId
                };
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterInsert Hook Failure ${err}`);
                });
                if (editedResult) {
                    return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(editedResult) : editedResult;
                }
            }
            const item = { ...!editedItem ? modifiedItem : editedItem, _id: insertedId };
            return convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item;
        }
        else {
            (0, error_manager_1.kaptanLogar)("00016", `acknowledged value returned from MongoDB is not true`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when inserting an item into a collection: ${err}`);
    }
}
