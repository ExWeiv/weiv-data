"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkInsert = void 0;
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
async function bulkInsert(collectionId, items, options) {
    try {
        const { safeItems, safeOptions } = await (0, validator_1.validateParams)({ collectionId, items, options }, ["collectionId", "items"], "bulkInsert");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern } = safeOptions || {};
        let ownerId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        let editedItems = safeItems.map(async (item) => {
            item._updatedDate = new Date();
            item._createdDate = new Date();
            item._owner = ownerId;
            if (suppressHooks != true) {
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [item, context]).catch((err) => {
                    throw new Error(`beforeInsert (bulkInsert) Hook Failure ${err}`);
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
        const { insertedIds, insertedCount, ok } = await collection.bulkWrite(writeOperations, { readConcern: readConcern ? readConcern : "local", ordered: true });
        const insertedItemIds = Object.keys(insertedIds).map((key) => {
            return insertedIds[key];
        });
        if (ok) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    const editedInsertItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [item, context]).catch((err) => {
                        throw new Error(`afterInsert (bulkInsert) Hook Failure ${err}`);
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
            return { insertedItems: editedItems, insertedItemIds, inserted: insertedCount };
        }
        else {
            throw new Error(`inserted: ${insertedCount}, ok: ${ok}`);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when inserting items using bulkInsert: ${err}`);
    }
}
exports.bulkInsert = bulkInsert;
