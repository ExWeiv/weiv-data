"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdate = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
async function bulkUpdate(collectionId, items, options) {
    try {
        if (!collectionId || !items) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }
        for (const item of items) {
            if (!item._id) {
                throw Error(`WeivData - Item (_id) ID is required for each item when bulk updating ID is missing for one or more item in your array!`);
            }
        }
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};
        let editedItems = items.map(async (item) => {
            item._id = (0, item_helpers_1.convertStringId)(item._id);
            if (suppressHooks != true) {
                const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeUpdate (bulkUpdate) Hook Failure ${err}`);
                });
                if (editedItem) {
                    return {
                        ...editedItem,
                        _updatedDate: new Date()
                    };
                }
                else {
                    return {
                        ...item,
                        _updatedDate: new Date()
                    };
                }
            }
            else {
                return {
                    ...item,
                    _updatedDate: new Date()
                };
            }
        });
        editedItems = await Promise.all(editedItems);
        const bulkOperations = editedItems.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: item }
                }
            };
        });
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { matchedCount } = await collection.bulkWrite(bulkOperations, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (suppressHooks != true) {
            editedItems = editedItems.map(async (item) => {
                const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterUpdate (bulkUpdate) Hook Failure ${err}`);
                });
                if (editedItem) {
                    return editedItem;
                }
                else {
                    return item;
                }
            });
            editedItems = await Promise.all(editedItems);
        }
        return {
            updated: matchedCount,
            updatedItems: editedItems
        };
    }
    catch (err) {
        throw Error(`WeivData - Error when updating items using bulkUpdate: ${err}`);
    }
}
exports.bulkUpdate = bulkUpdate;
