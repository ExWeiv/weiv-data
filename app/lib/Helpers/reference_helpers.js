"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferences = exports.getCurrentItemId = void 0;
const item_helpers_1 = require("./item_helpers");
const getCurrentItemId = (referringItem) => {
    if (typeof referringItem === 'object' && referringItem !== null && referringItem._id !== undefined && referringItem._id) {
        // Handle object cases:
        const id = referringItem._id;
        return (0, item_helpers_1.convertStringId)(id); // Use convertStringId to handle string or ObjectId
    }
    else if (typeof referringItem === 'string') {
        // Create ObjectId from string using convertStringId:
        return (0, item_helpers_1.convertStringId)(referringItem);
    }
    else if (ObjectId.isValid(referringItem)) {
        // Already an ObjectId, return it directly:
        return referringItem;
    }
    else {
        throw new Error('WeivData - Error: Invalid value type, expected object with _id, string, or ObjectId');
    }
};
exports.getCurrentItemId = getCurrentItemId;
const getReferences = (referencedItem) => {
    if (Array.isArray(referencedItem)) {
        // Handle arrays (Items or ItemIDs):
        return referencedItem.flatMap((itemOrId) => (0, exports.getReferences)(itemOrId)); // Recursively handle elements
    }
    else if (typeof referencedItem === 'object' && referencedItem !== null && referencedItem._id !== undefined && referencedItem._id) {
        // Handle objects (Items):
        return [(0, exports.getReferences)(referencedItem._id)]; // Extract, process, and wrap in an array
    }
    else {
        // Handle string or ObjectId (ItemID) using convertStringId:
        return [(0, item_helpers_1.convertStringId)(referencedItem)]; // Leverage the helper function for conversion
    }
};
exports.getReferences = getReferences;
