"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdate = void 0;
const lodash_1 = require("lodash");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function bulkUpdate(collectionId, items, options) {
    try {
        if (!collectionId || !items) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }
        for (const item of items) {
            if (!item._id) {
                throw Error(`WeivData - Item (_id) ID is required for each item when bulk updating ID is missing for one or more item in your array!`);
            }
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date()
        };
        const editedItems = items.map((item) => {
            item._id = (0, item_helpers_1.convertStringId)(item._id);
            item = (0, lodash_1.merge)(defaultValues, item);
            return item;
        });
        const query = {
            _id: { $in: editedItems.map((item) => (0, item_helpers_1.convertStringId)(item._id)) },
        };
        const updateObjects = editedItems.map((item) => ({
            $set: item.updatedFields,
        }));
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        let succeed = true;
        let updated = 0;
        for (let i = 0; i < editedItems.length; i += 50) {
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
                updatedItemIds: editedItems.map((item) => item._id)
            };
        }
        else {
            throw Error(`WeivData - Error when updating items using bulkUpdate, acknowledged: ${succeed}, updated: ${updated}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when updating items using bulkUpdate: ${err}`);
    }
}
exports.bulkUpdate = bulkUpdate;
