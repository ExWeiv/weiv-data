"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReference = removeReference;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
async function removeReference(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        const { safeOptions, safeReferencedItemIds, safeReferringItemId } = await (0, validator_1.validateParams)({ collectionId, propertyName, referringItem, referencedItem, options }, ["collectionId", "propertyName", "referringItem", "referencedItem"], "removeReference");
        const { suppressAuth, readConcern } = safeOptions || {};
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne({ _id: safeReferringItemId }, { $pull: { [propertyName]: { $in: safeReferencedItemIds } }, $set: { _updatedDate: new Date() } }, { readConcern });
        if (!acknowledged || modifiedCount <= 0) {
            (0, error_manager_1.kaptanLogar)("00017", `could not remove references, MongoDB acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00017", `when removing references: ${err}`);
    }
}
