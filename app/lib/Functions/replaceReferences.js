"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceReferences = void 0;
const log_handlers_1 = require("../Log/log_handlers");
const reference_helpers_1 = require("../Helpers/reference_helpers");
const update_1 = require("./update");
async function replaceReferences(collectionId, propertyName, referringItem, referencedItem, options) {
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
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const updated = await (0, update_1.update)(collectionId, { _id: itemId, [propertyName]: references.length > 1 ? references : references[0] }, options);
        if (!updated) {
            (0, log_handlers_1.reportError)("Operation failed");
        }
    }
    catch (err) {
        console.error(err);
    }
}
exports.replaceReferences = replaceReferences;
