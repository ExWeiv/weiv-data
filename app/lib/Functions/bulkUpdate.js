"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdate = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
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
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};
        const editedItems = items.map((item) => {
            item._id = (0, item_helpers_1.convertStringId)(item._id);
            return {
                ...item,
                _updatedDate: new Date()
            };
        });
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
