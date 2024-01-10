"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRemove = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const log_handlers_1 = require("../Log/log_handlers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function bulkRemove(collectionId, itemIds, options) {
    try {
        if (!collectionId) {
            (0, log_handlers_1.reportError)("CollectionID is required when removing an item from a collection");
        }
        if (!itemIds) {
            (0, log_handlers_1.reportError)("ItemIds are required when removing items from a collection");
        }
        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        itemIds = itemIds.map((itemId) => {
            return (0, item_helpers_1.convertStringId)(itemId);
        });
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, deletedCount, } = await collection.deleteMany({ _id: { $in: itemIds } });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged === true) {
            return {
                removed: deletedCount,
                removedItemIds: itemIds
            };
        }
        else {
            (0, log_handlers_1.reportError)('Failed to remove items!');
        }
    }
    catch (err) {
        console.error(err);
        return err;
    }
}
exports.bulkRemove = bulkRemove;
