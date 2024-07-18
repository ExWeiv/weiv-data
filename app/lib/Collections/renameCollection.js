"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameCollection = renameCollection;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const name_helpers_1 = require("../Helpers/name_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
async function renameCollection(collectionId, newCollectionName, suppressAuth, renameOptions) {
    try {
        const { safeCollectionOptions } = await (0, validator_1.validateParams)({ collectionId, newCollectionName, suppressAuth, collectionOptions: renameOptions }, ["collectionId", "newCollectionName"], "renameCollection");
        const { database } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        await database.renameCollection(collectionName, newCollectionName, safeCollectionOptions);
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00022", `when renaming a collection, details: ${err}`);
    }
}
