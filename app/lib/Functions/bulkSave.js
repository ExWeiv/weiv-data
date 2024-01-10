"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkSave = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function bulkSave(collectionId, items, options) {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when saving an item in a collection");
        }
        if (!items || items.length === 0) {
            reportError('Items array is required and it should not ve empty');
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        let ownerId = "";
        if (enableOwnerId === true) {
            ownerId = await (0, member_id_helpers_1.getOwnerId)();
        }
        items = items.map((item) => {
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
        const query = {
            _id: { $in: items.map((item) => item._id) },
        };
        const updateObjects = items.map((item) => ({
            $set: item.updatedFields,
        }));
        let succeed = true;
        let inserted = 0;
        let updated = 0;
        for (let i = 0; i < items.length; i += 50) {
            const updateBatch = updateObjects.slice(i, i + 50);
            const { upsertedCount, acknowledged, modifiedCount } = await collection.updateMany(query, updateBatch, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });
            succeed = acknowledged;
            inserted = inserted + upsertedCount;
            updated = updated + modifiedCount;
        }
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (succeed === true) {
            return {
                inserted,
                updated,
                items
            };
        }
        else {
            reportError('Failed to save items!');
        }
    }
    catch (err) {
        console.error(err);
        return err;
    }
}
exports.bulkSave = bulkSave;
