"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkInsert = void 0;
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
async function bulkInsert(collectionId, items, options) {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, consistentRead } = options || {};
        let ownerId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        let editedItems = items.map(async (item) => {
            item._updatedDate = new Date();
            item._createdDate = new Date();
            item._owner = ownerId;
            if (suppressHooks != true) {
                let editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeInsert (bulkInsert) Hook Failure ${err}`);
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
        const { insertedIds, insertedCount, ok } = await collection.bulkWrite(writeOperations, { readConcern: consistentRead === true ? "majority" : "local", ordered: true });
        const insertedItemIds = Object.keys(insertedIds).map((key) => {
            return insertedIds[key];
        });
        if (ok) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    const editedInsertItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [item, context]).catch((err) => {
                        throw Error(`WeivData - afterInsert (bulkInsert) Hook Failure ${err}`);
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
            throw Error(`WeivData - Error when inserting items using bulkInsert, inserted: ${insertedCount}, ok: ${ok}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when inserting items using bulkInsert: ${err}`);
    }
}
exports.bulkInsert = bulkInsert;
