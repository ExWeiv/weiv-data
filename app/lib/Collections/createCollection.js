"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
async function createCollection(collectionId, options, createOptions) {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }
        const { suppressAuth } = options || {};
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        return await database.createCollection(collectionName, createOptions);
    }
    catch (err) {
        throw Error(`WeivData - Error when creating a new collection in a database, details: ${err}`);
    }
}
exports.createCollection = createCollection;
