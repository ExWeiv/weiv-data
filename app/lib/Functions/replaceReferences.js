"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceReferences = void 0;
const reference_helpers_1 = require("../Helpers/reference_helpers");
const update_1 = require("./update");
async function replaceReferences(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const updated = await (0, update_1.update)(collectionId, { _id: itemId, [propertyName]: references.length > 1 ? references : references[0] }, options);
        if (!updated) {
            throw Error(`WeivData - Error when replacing references, result: ${updated}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when replacing references: ${err}`);
    }
}
exports.replaceReferences = replaceReferences;
