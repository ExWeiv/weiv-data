"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkInsert = void 0;
const lodash_1 = require("lodash");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const log_handlers_1 = require("../Log/log_handlers");
async function bulkInsert(collectionId, items, options) {
    try {
        if (!collectionId) {
            (0, log_handlers_1.reportError)("CollectionID is required when inserting an item in a collection");
        }
        if (items.length === 0) {
            (0, log_handlers_1.reportError)('Items array is empty');
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date(),
            _createdDate: new Date(),
            _owner: ""
        };
        if (enableOwnerId === true) {
            defaultValues._owner = await (0, member_id_helpers_1.getOwnerId)();
        }
        items = items.map((item) => {
            item = (0, lodash_1.merge)(item, defaultValues);
            return item;
        });
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedIds, insertedCount, acknowledged } = await collection.insertMany(items);
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged === true) {
            return { insertedItems: items, insertedItemIds: insertedIds, inserted: insertedCount };
        }
        else {
            (0, log_handlers_1.reportError)('Failed to insert items!');
        }
    }
    catch (err) {
        console.error(err);
        return err;
    }
}
exports.bulkInsert = bulkInsert;
