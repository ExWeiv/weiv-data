"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferences = exports.getCurrentItemId = void 0;
const item_helpers_1 = require("./item_helpers");
const mongodb_1 = require("mongodb");
const getCurrentItemId = (referringItem) => {
    if (typeof referringItem === 'object' && referringItem !== null && referringItem._id !== undefined && referringItem._id) {
        const id = referringItem._id;
        return (0, item_helpers_1.convertStringId)(id);
    }
    else if (typeof referringItem === 'string') {
        return (0, item_helpers_1.convertStringId)(referringItem);
    }
    else if (mongodb_1.ObjectId.isValid(referringItem)) {
        return referringItem;
    }
    else {
        throw new Error('WeivData - Error: Invalid value type, expected object with _id, string, or ObjectId');
    }
};
exports.getCurrentItemId = getCurrentItemId;
const getReferences = (referencedItem) => {
    if (Array.isArray(referencedItem)) {
        return referencedItem.flatMap((itemOrId) => (0, exports.getReferences)(itemOrId));
    }
    else if (typeof referencedItem === 'object' && referencedItem !== null && referencedItem._id !== undefined && referencedItem._id) {
        return [(0, exports.getReferences)(referencedItem._id)];
    }
    else {
        return [(0, item_helpers_1.convertStringId)(referencedItem)];
    }
};
exports.getReferences = getReferences;
