"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceReferences = replaceReferences;
const validator_1 = require("../Helpers/validator");
const update_1 = require("./update");
const error_manager_1 = require("../Errors/error_manager");
async function replaceReferences(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        const { safeOptions, safeReferringItemId, safeReferencedItemIds } = await (0, validator_1.validateParams)({ collectionId, propertyName, referringItem, referencedItem, options }, ["collectionId", "propertyName", "referringItem", "referencedItem"], "replaceReferences");
        const updated = await (0, update_1.update)(collectionId, { _id: safeReferringItemId, [propertyName]: safeReferencedItemIds }, safeOptions);
        if (!updated) {
            (0, error_manager_1.kaptanLogar)("00017", `couldn't replace references: ${updated}`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00017", `when replacing references, ${err}`);
    }
}
