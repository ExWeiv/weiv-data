"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferencesItemIds = exports.getReferenceItemId = void 0;
const mongodb_1 = require("mongodb");
const validator_1 = require("./validator");
const lodash_1 = require("lodash");
const error_manager_1 = require("../Errors/error_manager");
const id_converters_1 = require("../Functions/id_converters");
const getReferenceItemId = (referringItem) => {
    if (referringItem) {
        let safeReferringItem;
        if (mongodb_1.ObjectId.isValid(referringItem)) {
            if (typeof referringItem === "string") {
                return new mongodb_1.ObjectId(referringItem);
            }
            else if (typeof referringItem === "object") {
                return referringItem;
            }
            else {
                (0, error_manager_1.kaptanLogar)("00013", "ItemID is not a string or ObjectID so we can't convert it to ObjectID in any way");
            }
        }
        else {
            if (typeof referringItem === "object") {
                if (!referringItem._id) {
                    (0, error_manager_1.kaptanLogar)("00013", "when sending Item it must contain _id field in it with a valid value!");
                }
                safeReferringItem = (0, validator_1.copyOwnPropsOnly)(referringItem);
                return (0, id_converters_1.convertIdToObjectId)(safeReferringItem._id);
            }
            else {
                if (typeof referringItem !== "string") {
                    (0, error_manager_1.kaptanLogar)("00013", "ItemID must be ObjectId or StringId! It cannot be something else!");
                }
                return (0, id_converters_1.convertIdToObjectId)(referringItem);
            }
        }
    }
    else {
        (0, error_manager_1.kaptanLogar)("00013", "RefferingItem is empty there is no value!");
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
        (0, error_manager_1.kaptanLogar)("00013", "ReferencedItem is empty there is no value!");
    }
};
exports.getReferencesItemIds = getReferencesItemIds;
