"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function save(collectionId, item, options) {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        let itemId;
        if (item._id && typeof item._id === "string") {
            itemId = (0, item_helpers_1.convertStringId)(item._id);
            delete item._id;
        }
        if (!item._createdDate) {
            item._createdDate = new Date();
        }
        item._updatedDate = new Date();
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const filter = itemId ? { _id: itemId } : {};
        const { upsertedId, acknowledged } = await collection.updateOne(filter, { $set: item }, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });
        if (cleanupAfter === true) {
            await cleanup();
        }
        const returnedItem = { ...item, _id: itemId };
        if (acknowledged) {
            if (upsertedId) {
                return { item: returnedItem, upsertedId };
            }
            else {
                return { item: returnedItem };
            }
        }
        else {
            throw Error(`WeivData - Error when saving an item to collection, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when saving an item to collection: ${err}`);
    }
}
exports.save = save;
