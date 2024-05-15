"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertReference = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
async function insertReference(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        const { safeReferencedItemIds, safeReferringItemId, safeOptions } = await (0, validator_1.validateParams)({ collectionId, propertyName, referringItem, referencedItem, options }, ["collectionId", "propertyName", "referringItem", "referencedItem"], "insertReference");
        const { suppressAuth, readConcern } = safeOptions || {};
        const references = safeReferencedItemIds;
        const itemId = safeReferringItemId;
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne({ _id: itemId }, { $push: { [propertyName]: { $each: references } }, $set: { _updatedDate: new Date() } }, { readConcern: readConcern ? readConcern : "local" });
        if (!acknowledged || modifiedCount <= 0) {
            throw new Error(`acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`);
        }
    }
    catch (err) {
        throw new Error(`Error when inserting a reference item into an item: ${err}`);
    }
}
exports.insertReference = insertReference;
