"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollection = createCollection;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
async function createCollection(collectionId, suppressAuth, createOptions) {
    try {
        const { safeCollectionOptions } = await (0, validator_1.validateParams)({ collectionId, collectionOptions: createOptions, suppressAuth }, ["collectionId"], "createCollection");
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        await database.createCollection(collectionName, safeCollectionOptions);
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00022", `when creating a new collection in a database, details: ${err}`);
    }
}
