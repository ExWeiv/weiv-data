"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameCollection = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
const validator_1 = require("../Helpers/validator");
async function renameCollection(collectionId, newCollectionName, options, renameOptions) {
    try {
        const { safeCollectionOptions, safeOptions } = await (0, validator_1.validateParams)({ collectionId, newCollectionName, options, collectionOptions: renameOptions }, ["collectionId", "newCollectionName"], "renameCollection");
        const { suppressAuth } = safeOptions || {};
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth, true);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        await database.renameCollection(collectionName, newCollectionName, safeCollectionOptions);
    }
    catch (err) {
        throw Error(`WeivData - Error when renaming a collection, details: ${err}`);
    }
}
exports.renameCollection = renameCollection;
