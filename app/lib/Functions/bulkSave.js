"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkSave = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
async function bulkSave(collectionId, items, options) {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, consistentRead } = options || {};
        let ownerId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        let editedItems = items.map(async (item) => {
            if (!item._owner) {
                item._owner = ownerId;
            }
            if (item._id) {
                if (suppressHooks != true) {
                    const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                        throw Error(`WeivData - beforeUpdate (bulkSave) Hook Failure ${err}`);
                    });
                    if (editedItem) {
                        return editedItem;
                    }
                    else {
                        return item;
                    }
                }
                else {
                    item._id = (0, item_helpers_1.convertStringId)(item._id);
                    return item;
                }
            }
            else {
                if (suppressHooks != true) {
                    const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [item, context]).catch((err) => {
                        throw Error(`WeivData - beforeInsert (bulkSave) Hook Failure ${err}`);
                    });
                    if (editedItem) {
                        return editedItem;
                    }
                    else {
                        return item;
                    }
                }
                else {
                    return item;
                }
            }
        });
        editedItems = await Promise.all(editedItems);
        const bulkOperations = editedItems.map((item) => {
            if (item._id) {
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: { $set: { ...item, _updatedDate: new Date() }, $setOnInsert: !item._createdDate ? { _createdDate: new Date() } : {} },
                        upsert: true
                    }
                };
            }
            else {
                return {
                    insertOne: {
                        document: item
                    }
                };
            }
        });
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedCount, modifiedCount, insertedIds, hasWriteErrors, getWriteErrors } = await collection.bulkWrite(bulkOperations, { readConcern: consistentRead === true ? "majority" : "local", ordered: true });
        if (!hasWriteErrors()) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    if (item._id) {
                        const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [item, context]).catch((err) => {
                            throw Error(`WeivData - afterUpdate (bulkSave) Hook Failure ${err}`);
                        });
                        if (editedItem) {
                            return editedItem;
                        }
                        else {
                            return item;
                        }
                    }
                    else {
                        const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [item, context]).catch((err) => {
                            throw Error(`WeivData - afterInsert Hook Failure ${err}`);
                        });
                        if (editedItem) {
                            return editedItem;
                        }
                        else {
                            return item;
                        }
                    }
                });
                editedItems = await Promise.all(editedItems);
            }
            const editedInsertedIds = Object.keys(insertedIds).map((key) => {
                return insertedIds[key];
            });
            return {
                insertedItemIds: editedInsertedIds,
                inserted: insertedCount,
                updated: modifiedCount,
                savedItems: editedItems
            };
        }
        else {
            throw Error(`WeivData - Error when saving items using bulkSave: inserted: ${insertedCount}, updated: ${modifiedCount}, write errors: ${getWriteErrors()}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when saving items using bulkSave: ${err}`);
    }
}
exports.bulkSave = bulkSave;
