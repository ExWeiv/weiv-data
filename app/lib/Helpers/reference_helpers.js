"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferencesItemIds = exports.getReferenceItemId = void 0;
const item_helpers_1 = require("./item_helpers");
const mongodb_1 = require("mongodb");
const validator_1 = require("./validator");
const lodash_1 = require("lodash");
const getReferenceItemId = (referringItem) => {
    if (referringItem) {
        let safeReferringItem;
        if (mongodb_1.ObjectId.isValid(referringItem)) {
            return referringItem;
        }
        else {
            if (typeof referringItem === "object") {
                if (!referringItem._id) {
                    throw new Error(`when sending Item it must contain _id field in it with a valid value!`);
                }
                safeReferringItem = (0, validator_1.copyOwnPropsOnly)(referringItem);
                return (0, item_helpers_1.convertStringId)(safeReferringItem._id);
            }
            else {
                if (typeof referringItem !== "string") {
                    throw new Error(`ItemID must be ObjectId or StringId! It cannot be something else!`);
                }
                return (0, item_helpers_1.convertStringId)(referringItem);
                ;
            }
        }
    }
    else {
        throw new Error(`RefferingItem is empty there is no value!`);
    }
};
exports.getReferenceItemId = getReferenceItemId;
const getReferencesItemIds = (referencedItem) => {
    if (referencedItem) {
        let saveObjectIds = [];
        if ((0, lodash_1.isArray)(referencedItem)) {
            for (const i of referencedItem) {
                saveObjectIds.push((0, exports.getReferenceItemId)(i));
            }
            return saveObjectIds;
        }
        else {
            saveObjectIds.push((0, exports.getReferenceItemId)(referencedItem));
            return saveObjectIds;
        }
    }
    else {
        throw new Error(`ReferencedItem is empty there is no value!`);
    }
};
exports.getReferencesItemIds = getReferencesItemIds;
