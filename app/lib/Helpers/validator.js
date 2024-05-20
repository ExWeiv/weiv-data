"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyOwnPropsOnly = exports.validateParams = void 0;
const reference_helpers_1 = require("./reference_helpers");
const item_helpers_1 = require("./item_helpers");
const lodash_1 = require("lodash");
async function validateParams(params, requiredParams, func) {
    try {
        let safeItem;
        let safeOptions;
        let safeReferringItemId;
        let safeReferencedItemIds;
        let safeItemId;
        let safeValue;
        let safeItems;
        let safeItemIds;
        let safeQueryOptions;
        let safeCollectionOptions;
        let safeCollectionFilter;
        const paramKeys = Object.entries(params);
        for (const [key, value] of paramKeys) {
            switch (key) {
                case "collectionId": {
                    if (value) {
                        if (typeof value !== "string") {
                            throw new Error(`type of collectionId is not string!`);
                        }
                    }
                    break;
                }
                case "item": {
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of item is not object!`);
                        }
                        else {
                            console.log("Before SafeItem:", value);
                            safeItem = copyOwnPropsOnly(value);
                        }
                    }
                    break;
                }
                case "options": {
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of options is not object!`);
                        }
                        else {
                            safeOptions = copyOwnPropsOnly(value);
                        }
                    }
                    break;
                }
                case "referringItem": {
                    safeReferringItemId = (0, reference_helpers_1.getReferenceItemId)(value);
                    break;
                }
                case "referencedItem": {
                    safeReferencedItemIds = (0, reference_helpers_1.getReferencesItemIds)(value);
                    break;
                }
                case "propertyName": {
                    if (value) {
                        if (typeof value !== "string") {
                            throw new Error(`propertyName must be string!`);
                        }
                    }
                    break;
                }
                case "itemId": {
                    if (value) {
                        safeItemId = (0, item_helpers_1.convertStringId)(value);
                    }
                    break;
                }
                case "value": {
                    if (value && typeof value === "object" && isPlainObject(value)) {
                        safeValue = copyOwnPropsOnly(value);
                    }
                    else {
                        safeValue = value;
                    }
                    break;
                }
                case 'items': {
                    if (value) {
                        if ((0, lodash_1.isArray)(value)) {
                            safeItems = value.map((item) => {
                                return copyOwnPropsOnly(item);
                            });
                        }
                        else {
                            throw new Error(`type of items is not array!`);
                        }
                    }
                    break;
                }
                case 'itemIds': {
                    if (value) {
                        if ((0, lodash_1.isArray)(value)) {
                            safeItemIds = value.map((itemId) => {
                                return (0, item_helpers_1.convertStringId)(itemId);
                            });
                        }
                        else {
                            throw new Error(`itemIds must be an array`);
                        }
                    }
                    break;
                }
                case 'queryOptions': {
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of queryOptions is not object!`);
                        }
                        else {
                            safeQueryOptions = copyOwnPropsOnly(value);
                        }
                    }
                    break;
                }
                case 'collectionOptions': {
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of collection action options is not object!`);
                        }
                        else {
                            safeCollectionOptions = copyOwnPropsOnly(value);
                        }
                    }
                    break;
                }
                case 'collectionFilter': {
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of collection filter is not object!`);
                        }
                        else {
                            safeCollectionFilter = copyOwnPropsOnly(value);
                        }
                    }
                    break;
                }
                case "suppressAuth": {
                    if (typeof value !== "boolean") {
                        throw new Error(`type of suppressAuth is not boolean!`);
                    }
                    break;
                }
                default: {
                    break;
                }
            }
            if (requiredParams.includes(key)) {
                if (!value || value === null || value === undefined) {
                    throw new Error(`${key} is required param for ${func} function!`);
                }
            }
        }
        const functionList = [
            "update",
            "replace",
            "bulkUpdate"
        ];
        if (functionList.includes(func)) {
            checkItemIds(params, func);
        }
        return {
            safeItem,
            safeOptions,
            safeReferencedItemIds,
            safeReferringItemId,
            safeItemId,
            safeValue,
            safeItems,
            safeItemIds,
            safeQueryOptions,
            safeCollectionOptions,
            safeCollectionFilter
        };
    }
    catch (err) {
        throw new Error(`Validation Error!, ${err}`);
    }
}
exports.validateParams = validateParams;
function checkItemIds(params, func) {
    try {
        const bulkFunctions = [
            "bulkUpdate"
        ];
        if (bulkFunctions.includes(func)) {
            for (const item of params.items) {
                if (!item._id) {
                    throw new Error(`item must contain _id property, _id is missing from item object in items array!`);
                }
            }
        }
        else {
            if (!params.item._id) {
                throw new Error(`item must contain _id property, _id is missing from item object!`);
            }
        }
        return null;
    }
    catch (err) {
        throw new Error(`params doesn't contain item data (weiv-data internal error please report BUG)`);
    }
}
function copyOwnPropsOnly(src) {
    const result = Object.create(null);
    function copyObject(value) {
        if (isPlainObject(value)) {
            return copyOwnPropsOnly(value);
        }
        else {
            return value;
        }
    }
    for (const key of Object.getOwnPropertyNames(src)) {
        if (key !== "__proto__" || "constructor" || "prototype") {
            if (typeof src[key] === "object") {
                result[key] = copyObject(src[key]);
            }
            else {
                result[key] = src[key];
            }
        }
    }
    return result;
}
exports.copyOwnPropsOnly = copyOwnPropsOnly;
function isPlainObject(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    if (Array.isArray(value))
        return false;
    return value.constructor === Object;
}
