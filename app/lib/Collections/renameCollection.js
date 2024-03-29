"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameCollection = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
async function renameCollection(collectionId, newCollectionName, options, renameOptions) {
    try {
        if (!collectionId || !newCollectionName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, newCollectionName`);
        }
        const { suppressAuth } = options || {};
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth, true);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        await database.renameCollection(collectionName, newCollectionName, renameOptions);
    }
    catch (err) {
        throw Error(`WeivData - Error when renaming a collection, details: ${err}`);
    }
}
exports.renameCollection = renameCollection;
