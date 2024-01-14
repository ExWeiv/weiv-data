"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function save(collectionId, item, options) {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        if (item._id && typeof item._id === "string") {
            item._id = (0, item_helpers_1.convertStringId)(item._id);
        }
        if (!item._createdDate) {
            item._createdDate = new Date();
        }
        item._updatedDate = new Date();
        if (!item._owner && enableOwnerId === true) {
            item._owner = await (0, member_id_helpers_1.getOwnerId)();
        }
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { upsertedId, acknowledged } = await collection.updateOne(item._id === undefined ? { _id: item._id } : {}, { $set: item }, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged) {
            if (upsertedId) {
            }
            else {
            }
            return item;
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
