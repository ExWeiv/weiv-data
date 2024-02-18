"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertReference = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const reference_helpers_1 = require("../Helpers/reference_helpers");
async function insertReference(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }
        const { suppressAuth, consistentRead } = options || {};
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne({ _id: itemId }, { $push: { [propertyName]: { $each: references } }, $set: { _updatedDate: new Date() } }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (acknowledged) {
            if (modifiedCount <= 0) {
                throw Error(`WeivData - Operation is not succeed! Modified item count: ${modifiedCount}`);
            }
        }
        else {
            throw Error(`Error when inserting a reference item into an item, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`Error when inserting a reference item into an item: ${err}`);
    }
}
exports.insertReference = insertReference;
