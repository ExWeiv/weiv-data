"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdate = void 0;
const lodash_1 = require("lodash");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const log_handlers_1 = require("../Log/log_handlers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function bulkUpdate(collectionId, items, options) {
    try {
        if (!collectionId) {
            (0, log_handlers_1.reportError)("CollectionID is required when updating an item from a collection");
        }
        if (!items) {
            (0, log_handlers_1.reportError)("items are required when bulk updating");
        }
        else {
            for (const item of items) {
                if (!item._id) {
                    (0, log_handlers_1.reportError)("_id is required in the item object when updating");
                }
            }
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date()
        };
        items = items.map((item) => {
            item._id = (0, item_helpers_1.convertStringId)(item._id);
            item = (0, lodash_1.merge)(item, defaultValues);
            return item;
        });
        const query = {
            _id: { $in: items.map((item) => item._id) },
        };
        const updateObjects = items.map((item) => ({
            $set: item.updatedFields,
        }));
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        let succeed = true;
        let updated = 0;
        for (let i = 0; i < items.length; i += 50) {
            const updateBatch = updateObjects.slice(i, i + 50);
            const { modifiedCount, acknowledged } = await collection.updateMany(query, updateBatch, { readConcern: consistentRead === true ? "majority" : "local" });
            succeed = acknowledged;
            updated = updated + modifiedCount;
        }
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (succeed === true) {
            return {
                updated,
                updatedItemIds: items.map((item) => item._id)
            };
        }
        else {
            (0, log_handlers_1.reportError)('Failed to update items');
        }
    }
    catch (err) {
        console.error(err);
        return err;
    }
}
exports.bulkUpdate = bulkUpdate;
