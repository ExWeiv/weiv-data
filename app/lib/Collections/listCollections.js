"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCollections = listCollections;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
async function listCollections(databaseName, suppressAuth, filter, listOptions) {
    try {
        const { safeCollectionFilter, safeCollectionOptions } = await (0, validator_1.validateParams)({ databaseName, suppressAuth, collectionFilter: filter, collectionOptions: listOptions }, ["databaseName"], "listCollections");
        const { database } = await (0, connection_helpers_1.connectionHandler)(`${databaseName}/`, suppressAuth);
        return await database.listCollections(safeCollectionFilter, safeCollectionOptions).toArray();
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00022", `when listing all collections in a database, details: ${err}`);
    }
}
