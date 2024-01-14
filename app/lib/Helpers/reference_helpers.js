"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferences = exports.getCurrentItemId = void 0;
const lodash_1 = __importDefault(require("lodash"));
const item_helpers_1 = require("./item_helpers");
const getCurrentItemId = (referringItem) => {
    if (lodash_1.default.isString(referringItem)) {
        return (0, item_helpers_1.convertStringId)(referringItem);
    }
    else if (lodash_1.default.isObject(referringItem) && !lodash_1.default.isArray(referringItem)) {
        return (0, item_helpers_1.convertStringId)(referringItem._id);
    }
    else {
        throw Error(`WeivData - Wrong referringItem type`);
    }
};
exports.getCurrentItemId = getCurrentItemId;
const getReferences = (referencedItem) => {
    if (lodash_1.default.isString(referencedItem)) {
        return [(0, item_helpers_1.convertStringId)(referencedItem)];
    }
    else if (lodash_1.default.isObject(referencedItem) && !lodash_1.default.isArray(referencedItem)) {
        return [(0, item_helpers_1.convertStringId)(referencedItem._id)];
    }
    else if (lodash_1.default.isObject(referencedItem) && lodash_1.default.isArray(referencedItem)) {
        if (lodash_1.default.every(referencedItem, (element) => lodash_1.default.isString(element))) {
            return referencedItem.map((itemId) => {
                if (typeof itemId === "string") {
                    return (0, item_helpers_1.convertStringId)(itemId);
                }
                else {
                    return (0, item_helpers_1.convertStringId)(itemId._id);
                }
            });
        }
        else if (lodash_1.default.every(referencedItem, (element) => lodash_1.default.isObject(element))) {
            return referencedItem.map((item) => {
                if (typeof item === "string") {
                    return (0, item_helpers_1.convertStringId)(item);
                }
                else {
                    return (0, item_helpers_1.convertStringId)(item._id);
                }
            });
        }
        else {
            throw Error(`WeivData - Wrong referencedItem type`);
        }
    }
    else {
        throw Error(`WeivData - Wrong referencedItem type`);
    }
};
exports.getReferences = getReferences;
