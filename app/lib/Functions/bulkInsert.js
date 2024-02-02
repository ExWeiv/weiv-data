"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkInsert = void 0;
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
async function bulkInsert(collectionId, items, options) {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableVisitorId, consistentRead } = options || {};
        let ownerId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        for (const item of items) {
            item._updatedDate = new Date();
            item._createdDate = new Date();
            item._owner = ownerId;
        }
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedIds, insertedCount, acknowledged } = await collection.insertMany(items, { readConcern: consistentRead === true ? "majority" : "local" });
        const insertedItemIds = Object.keys(insertedIds).map((key) => {
            return insertedIds[key];
        });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged === true) {
            return { insertedItems: items, insertedItemIds, inserted: insertedCount };
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
