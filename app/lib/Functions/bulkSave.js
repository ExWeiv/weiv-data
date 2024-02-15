"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkSave = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
/**
 * Inserts or updates a number of items in a collection.
 *
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 *
 * // Items that will be bulk saved
 * const itemsToSave = [{...}, {...}, {...}]
 *
 * const result = await weivData.bulkSave("Clusters/Odunpazari", itemsToSave)
 * console.log(result);
 * ```
 *
 * @param collectionId The ID of the collection to save the items to.
 * @param items The items to insert or update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<WeivDataBulkSaveResult | void>} Fulfilled - The results of the bulk save. Rejected - The error that caused the rejection.
 */
async function bulkSave(collectionId, items, options) {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, enableVisitorId, consistentRead } = options || {};
        let ownerId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        let editedItems = items.map(async (item) => {
            // Add _createdDate if there is not one
            if (!item._createdDate) {
                item._createdDate = new Date();
            }
            // Update _updatedDate value
            item._updatedDate = new Date();
            if (!item._owner) {
                item._owner = ownerId;
            }
            // Convert ID to ObjectId if exist
            if (item._id) {
                // Run beforeUpdate hook for that item.
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
                // Run beforeInsert hook for that item.
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
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const bulkOperations = editedItems.map((item) => {
            if (item._id) {
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: { $set: item },
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
        const { insertedCount, modifiedCount, insertedIds } = await collection.bulkWrite(bulkOperations, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (suppressHooks != true) {
            editedItems = editedItems.map(async (item) => {
                if (item._id) {
                    // Run afterUpdate hook for that item.
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
                    // Run afterInsert hook for that item.
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
            return (0, item_helpers_1.convertStringId)(insertedIds[key]);
        });
        return {
            insertedItemIds: editedInsertedIds,
            inserted: insertedCount,
            updated: modifiedCount,
            savedItems: editedItems
        };
    }
    catch (err) {
        throw Error(`WeivData - Error when saving items using bulkSave: ${err}`);
    }
}
exports.bulkSave = bulkSave;
