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
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        const defaultValues = {
            _updatedDate: new Date()
        };
        const itemId = (0, item_helpers_1.convertStringId)(item._id);
        const updateItem = (0, lodash_1.merge)(item, defaultValues);
        delete updateItem._id;
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { ok, value, lastErrorObject } = await collection.findOneAndUpdate({ _id: itemId }, { $set: updateItem }, { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (ok === 1) {
            return value || {};
        }
        else {
            throw Error(`WeivData - Error when updating an item, acknowledged: ${lastErrorObject}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when updating an item: ${err}`);
    }
}
exports.update = update;
