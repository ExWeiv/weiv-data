"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReference = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
async function removeReference(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        const { safeOptions, safeReferencedItemIds, safeReferringItemId } = await (0, validator_1.validateParams)({ collectionId, propertyName, referringItem, referencedItem, options }, ["collectionId", "propertyName", "referringItem", "referencedItem"], "removeReference");
        const { suppressAuth, readConcern } = safeOptions || {};
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne({ _id: safeReferringItemId }, { $pull: { [propertyName]: { $in: safeReferencedItemIds } }, $set: { _updatedDate: new Date() } }, { readConcern: readConcern ? readConcern : "local" });
        if (!acknowledged || modifiedCount <= 0) {
            throw Error(`WeivData - Error when removing references, acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when removing references: ${err}`);
    }
}
exports.removeReference = removeReference;
