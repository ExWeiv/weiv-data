"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRemove = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function bulkRemove(collectionId, itemIds, options) {
    try {
        if (!collectionId || !itemIds) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemIds`);
        }
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        const newItemIds = itemIds.map((itemId) => {
            return (0, item_helpers_1.convertStringId)(itemId);
        });
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, deletedCount } = await collection.deleteMany({ _id: { $in: newItemIds } }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged === true) {
            return {
                removed: deletedCount,
                removedItemIds: newItemIds
            };
        }
        else {
            throw Error(`WeivData - Error when removing items using bulkRemove, acknowledged: ${acknowledged}, deletedCount: ${deletedCount}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}
exports.bulkRemove = bulkRemove;
