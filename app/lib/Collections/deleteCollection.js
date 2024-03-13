"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollection = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
async function deleteCollection(collectionId, options, deleteOptions) {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }
        const { suppressAuth } = options || {};
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth, true);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        return await database.dropCollection(collectionName, deleteOptions);
    }
    catch (err) {
        throw Error(`WeivData - Error when deleting a collection in a database, details: ${err}`);
    }
}
exports.deleteCollection = deleteCollection;
