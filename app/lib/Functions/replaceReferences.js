"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceReferences = void 0;
const validator_1 = require("../Helpers/validator");
const update_1 = require("./update");
async function replaceReferences(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        const { safeOptions, safeReferringItemId, safeReferencedItemIds } = await (0, validator_1.validateParams)({ collectionId, propertyName, referringItem, referencedItem, options }, ["collectionId", "propertyName", "referringItem", "referencedItem"], "replaceReferences");
        const updated = await (0, update_1.update)(collectionId, { _id: safeReferringItemId, [propertyName]: safeReferencedItemIds }, safeOptions);
        if (!updated) {
            throw new Error(`couldn't replace references: ${updated}`);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when replacing references, ${err}`);
    }
}
exports.replaceReferences = replaceReferences;
