"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameCollection = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
const validator_1 = require("../Helpers/validator");
async function renameCollection(collectionId, newCollectionName, suppressAuth, renameOptions) {
    try {
        const { safeCollectionOptions } = await (0, validator_1.validateParams)({ collectionId, newCollectionName, suppressAuth, collectionOptions: renameOptions }, ["collectionId", "newCollectionName"], "renameCollection");
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        await database.renameCollection(collectionName, newCollectionName, safeCollectionOptions);
    }
    catch (err) {
        throw new Error(`WeivData - Error when renaming a collection, details: ${err}`);
    }
}
exports.renameCollection = renameCollection;
