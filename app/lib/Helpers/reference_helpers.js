"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferences = exports.getCurrentItemId = void 0;
const lodash_1 = __importDefault(require("lodash"));
const item_helpers_1 = require("./item_helpers");
const log_handlers_1 = require("../Log/log_handlers");
const getCurrentItemId = (referringItem) => {
    if (lodash_1.default.isString(referringItem)) {
        return (0, item_helpers_1.convertStringId)(referringItem);
    }
    else if (lodash_1.default.isObject(referringItem) && !lodash_1.default.isArray(referringItem)) {
        return (0, item_helpers_1.convertStringId)(referringItem._id);
    }
    else {
        (0, log_handlers_1.reportError)("Wrong referringItem type");
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
            return referencedItem.map((itemId) => (0, item_helpers_1.convertStringId)(itemId));
        }
        else if (lodash_1.default.every(referencedItem, (element) => lodash_1.default.isObject(element))) {
            return referencedItem.map((item) => (0, item_helpers_1.convertStringId)(item._id));
        }
        else {
            (0, log_handlers_1.reportError)("Wrong referencedItem type");
        }
    }
    else {
        (0, log_handlers_1.reportError)("Wrong referencedItem type");
    }
};
exports.getReferences = getReferences;
