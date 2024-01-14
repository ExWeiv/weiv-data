"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const lodash_1 = require("lodash");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function update(collectionId, item, options) {
    try {
        if (!collectionId || !item._id) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item._id`);
        }
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date()
        };
        const itemId = (0, item_helpers_1.convertStringId)(item._id);
        item = (0, lodash_1.merge)(item, defaultValues);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged } = await collection.updateOne({ _id: itemId }, { $set: item }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged) {
            return item;
        }
        else {
            throw Error(`WeivData - Error when updating an item, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when updating an item: ${err}`);
    }
}
exports.update = update;
