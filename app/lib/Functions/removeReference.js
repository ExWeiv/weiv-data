"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReference = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const reference_helpers_1 = require("../Helpers/reference_helpers");
async function removeReference(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }
        const { suppressAuth, cleanupAfter, consistentRead } = options || { suppressAuth: false, cleanupAfter: false, consistentRead: false };
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const document = await collection.findOne({ _id: itemId }, { readConcern: consistentRead === true ? "majority" : "local" });
        const isMultiReference = Array.isArray(document?.[propertyName]);
        const updateOperation = isMultiReference
            ? { $pull: { [propertyName]: { $in: references } }, $set: { _updatedDate: new Date() } }
            : { $set: { [propertyName]: undefined, _updatedDate: new Date() } };
        const { acknowledged } = await collection.updateOne({ _id: itemId }, { ...updateOperation }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (!acknowledged) {
            throw Error(`WeivData - Error when removing references, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when removing references: ${err}`);
    }
}
exports.removeReference = removeReference;
