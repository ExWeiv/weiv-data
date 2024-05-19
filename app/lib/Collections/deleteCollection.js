"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollection = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
const validator_1 = require("../Helpers/validator");
async function deleteCollection(collectionId, options, deleteOptions) {
    try {
        const { safeCollectionOptions, safeOptions } = await (0, validator_1.validateParams)({ collectionId, collectionOptions: deleteOptions, options }, ["collectionId"], "deleteCollection");
        const { suppressAuth } = safeOptions || {};
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        return await database.dropCollection(collectionName, safeCollectionOptions);
    }
    catch (err) {
        throw new Error(`WeivData - Error when deleting a collection in a database, details: ${err}`);
    }
}
exports.deleteCollection = deleteCollection;
