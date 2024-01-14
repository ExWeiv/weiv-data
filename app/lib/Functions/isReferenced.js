"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReferenced = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const reference_helpers_1 = require("../Helpers/reference_helpers");
const lodash_1 = __importDefault(require("lodash"));
async function isReferenced(collectionId, propertyName, referringItem, referencedItem, options) {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }
        if (lodash_1.default.isArray(referencedItem)) {
            throw Error(`WeivData - Wrong item type for referencedItem, it shouldn't be an array`);
        }
        const { suppressAuth, cleanupAfter, consistentRead } = options || { suppressAuth: false, cleanupAfter: false, consistentRead: false };
        const references = (0, reference_helpers_1.getReferences)(referencedItem);
        const itemId = (0, reference_helpers_1.getCurrentItemId)(referringItem);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const totalCount = await collection.countDocuments({ _id: itemId, [propertyName]: { $in: references } }, { readConcern: consistentRead === true ? "majority" : "local" });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (totalCount > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when checking if item is referenced: ${err}`);
    }
}
exports.isReferenced = isReferenced;
