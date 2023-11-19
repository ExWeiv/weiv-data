"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const lodash_1 = require("lodash");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const log_handlers_1 = require("../Log/log_handlers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function update(collectionId, item, options) {
    try {
        if (!collectionId) {
            (0, log_handlers_1.reportError)("CollectionID is required when updating an item from a collection");
        }
        if (!item._id) {
            (0, log_handlers_1.reportError)("_id is required in the item object when updating");
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date()
        };
        item._id = (0, item_helpers_1.convertStringId)(item._id);
        item = (0, lodash_1.merge)(item, defaultValues);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        await collection.updateOne({ _id: item._id }, { $set: item }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        return item;
    }
    catch (err) {
        console.error(err);
        return err;
    }
}
exports.update = update;
