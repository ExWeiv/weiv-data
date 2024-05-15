"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
const validator_1 = require("../Helpers/validator");
async function createCollection(collectionId, options, createOptions) {
    try {
        const { safeCollectionOptions, safeOptions } = await (0, validator_1.validateParams)({ collectionId, collectionOptions: createOptions, options }, ["collectionId"], "createCollection");
        const { suppressAuth } = safeOptions || {};
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth, true);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        await database.createCollection(collectionName, safeCollectionOptions);
    }
    catch (err) {
        throw new Error(`WeivData - Error when creating a new collection in a database, details: ${err}`);
    }
}
exports.createCollection = createCollection;
