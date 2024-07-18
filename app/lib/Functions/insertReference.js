"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertReference = insertReference;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
async function insertReference(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        const { safeReferencedItemIds, safeReferringItemId, safeOptions } = await (0, validator_1.validateParams)({ collectionId, propertyName, referringItem, referencedItem, options }, ["collectionId", "propertyName", "referringItem", "referencedItem"], "insertReference");
        const { suppressAuth, readConcern } = safeOptions || {};
        const references = safeReferencedItemIds;
        const itemId = safeReferringItemId;
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne({ _id: itemId }, { $push: { [propertyName]: { $each: references } }, $set: { _updatedDate: new Date() } }, { readConcern });
        if (!acknowledged || modifiedCount <= 0) {
            (0, error_manager_1.kaptanLogar)("00017", `could not insert references, MongoDB acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00017", `when inserting a reference item into an item: ${err}`);
    }
}
