"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkInsert = void 0;
const lodash_1 = require("lodash");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
async function bulkInsert(collectionId, items, options) {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
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
        const newItems = items.map((item) => {
            item = (0, lodash_1.merge)(defaultValues, item);
            return item;
        });
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedIds, insertedCount, acknowledged } = await collection.insertMany(newItems);
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged === true) {
            return { insertedItems: items, insertedItemIds: insertedIds, inserted: insertedCount };
        }
        else {
            throw Error(`WeivData - Error when inserting items using bulkInsert, acknowledged: ${acknowledged}, insertedCount: ${insertedCount}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when inserting items using bulkInsert: ${err}`);
    }
}
exports.bulkInsert = bulkInsert;
