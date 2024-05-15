"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insert = void 0;
const lodash_1 = require("lodash");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
async function insert(collectionId, item, options) {
    try {
        const { safeItem, safeOptions } = await (0, validator_1.validateParams)({ collectionId, item, options }, ["collectionId", "item"], "insert");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern } = safeOptions || {};
        const defaultValues = {
            _updatedDate: new Date(),
            _createdDate: new Date(),
        };
        defaultValues["_owner"] = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        const modifiedItem = (0, lodash_1.merge)(defaultValues, safeItem);
        let editedItem;
        if (suppressHooks != true) {
            editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [modifiedItem, context]).catch((err) => {
                throw new Error(`beforeInsert Hook Failure ${err}`);
            });
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedId, acknowledged } = await collection.insertOne(!editedItem ? modifiedItem : editedItem, { readConcern: readConcern ? readConcern : "local" });
        if (acknowledged) {
            if (suppressHooks != true) {
                const editedResult = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [{ ...!editedItem ? modifiedItem : editedItem, _id: insertedId }, context]).catch((err) => {
                    throw new Error(`afterInsert Hook Failure ${err}`);
                });
                if (editedResult) {
                    return editedResult;
                }
            }
            return { ...!editedItem ? modifiedItem : editedItem, _id: insertedId };
        }
        else {
            throw new Error(`acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when inserting an item into a collection: ${err}`);
    }
}
exports.insert = insert;
