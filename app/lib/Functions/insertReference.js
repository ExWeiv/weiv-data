"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertReference = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const log_handlers_1 = require("../Log/log_handlers");
const reference_helpers_1 = require("../Helpers/reference_helpers");
async function insertReference(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        if (!collectionId) {
            (0, log_handlers_1.reportError)("Collection and Database name is required");
        }
        if (!propertyName) {
            (0, log_handlers_1.reportError)("Property name is required");
        }
        if (!referringItem) {
            (0, log_handlers_1.reportError)("Referring item is required");
        }
        if (!referencedItem) {
            (0, log_handlers_1.reportError)("Referenced item/s required");
        }
        const { suppressAuth, cleanupAfter, consistentRead } = options || { suppressAuth: false, cleanupAfter: false, consistentRead: false };
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { modifiedCount } = await collection.updateOne({ _id: itemId }, { $addToSet: { [propertyName]: { $each: references } }, $set: { _updatedDate: new Date() } }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (modifiedCount <= 0) {
            (0, log_handlers_1.reportError)("Operation is not succeed");
        }
        if (cleanupAfter === true) {
            await cleanup();
        }
    }
    catch (err) {
        console.error(err);
    }
}
exports.insertReference = insertReference;
