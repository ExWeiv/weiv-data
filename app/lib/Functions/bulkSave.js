"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkSave = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function bulkSave(collectionId, items, options) {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        let ownerId = "";
        if (enableOwnerId === true) {
            ownerId = await (0, member_id_helpers_1.getOwnerId)();
        }
        const newItems = items.map((item) => {
            if (item._id) {
                item._id = (0, item_helpers_1.convertStringId)(item._id);
            }
            if (!item._createdDate) {
                item._createdDate = new Date();
            }
            item._updatedDate = new Date();
            if (!item._owner) {
                item._owner = ownerId;
            }
            return item;
        });
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const bulkOperations = newItems.map((item) => {
            const { _id } = item;
            return {
                updateOne: {
                    filter: { _id },
                    update: { $set: item },
                    upsert: true
                }
            };
        });
        const { upsertedCount, modifiedCount, upsertedIds } = await collection.bulkWrite(bulkOperations, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        return {
            insertedItemIds: upsertedIds,
            inserted: upsertedCount,
            updated: modifiedCount,
            newItems
        };
    }
    catch (err) {
        throw Error(`WeivData - Error when saving items using bulkSave: ${err}`);
    }
}
exports.bulkSave = bulkSave;
