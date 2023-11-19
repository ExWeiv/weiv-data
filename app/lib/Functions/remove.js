"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const log_handlers_1 = require("../Log/log_handlers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function remove(collectionId, itemId, options) {
    try {
        if (!collectionId) {
            (0, log_handlers_1.reportError)("CollectionID is required when removing an item from a collection");
        }
        if (!itemId) {
            (0, log_handlers_1.reportError)("ItemId is required when removing an item from a collection");
        }
        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        itemId = (0, item_helpers_1.convertStringId)(itemId);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: itemId });
        const { acknowledged, deletedCount } = await collection.deleteOne({ _id: itemId });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged === true) {
            if (deletedCount === 1) {
                return item;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.error(err);
        return err;
    }
}
exports.remove = remove;
