"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function remove(collectionId, itemId, options) {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }
        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        const newItemId = (0, item_helpers_1.convertStringId)(itemId);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId });
        const { acknowledged, deletedCount } = await collection.deleteOne({ _id: newItemId });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged) {
            if (deletedCount === 1) {
                return item;
            }
            else {
                return null;
            }
        }
        else {
            throw Error(`WeivData - Error when removing an item from collection, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when removing an item from collection: ${err}`);
    }
}
exports.remove = remove;
