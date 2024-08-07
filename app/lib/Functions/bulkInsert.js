"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkInsert = bulkInsert;
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function bulkInsert(collectionId, items, options) {
    try {
        const { safeItems, safeOptions } = await (0, validator_1.validateParams)({ collectionId, items, options }, ["collectionId", "items"], "bulkInsert");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        let ownerId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        let editedItems = safeItems.map(async (item) => {
            item._updatedDate = new Date();
            item._createdDate = new Date();
            item._owner = ownerId;
            if (suppressHooks != true) {
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [item, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00002", `beforeInsert (bulkInsert) Hook Failure ${err}`);
                });
                if (editedItem) {
                    item = editedItem;
                }
            }
            return item;
        });
        editedItems = await Promise.all(editedItems);
        const writeOperations = editedItems.map((value) => {
            return {
                insertOne: {
                    document: value
                }
            };
        });
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedIds, insertedCount, ok } = await collection.bulkWrite(writeOperations, { readConcern, ordered: true });
        const insertedItemIds = Object.keys(insertedIds).map((key) => {
            return (0, internal_id_converter_1.convertToStringId)(insertedIds[key]);
        });
        if (ok) {
            if (suppressHooks != true) {
                editedItems = convertIds ? (0, internal_id_converter_1.recursivelyConvertIds)(editedItems) : editedItems;
                editedItems = editedItems.map(async (item) => {
                    const editedInsertItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [item, context]).catch((err) => {
                        (0, error_manager_1.kaptanLogar)("00003", `afterInsert (bulkInsert) Hook Failure ${err}`);
                    });
                    if (editedInsertItem) {
                        return editedInsertItem;
                    }
                    else {
                        return item;
                    }
                });
                editedItems = await Promise.all(editedItems);
            }
            return {
                insertedItems: convertIds ? (0, internal_id_converter_1.recursivelyConvertIds)(editedItems) : editedItems,
                inserted: insertedCount,
                insertedItemIds,
            };
        }
        else {
            (0, error_manager_1.kaptanLogar)("00016", `one or more items failed to be inserted`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when inserting items using bulkInsert: ${err}`);
    }
}
