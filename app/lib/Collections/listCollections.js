"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCollections = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
async function listCollections(databaseName, suppressAuth, filter, listOptions) {
    try {
        const { safeCollectionFilter, safeCollectionOptions } = await (0, validator_1.validateParams)({ databaseName, suppressAuth, collectionFilter: filter, collectionOptions: listOptions }, ["databaseName"], "listCollections");
        const { database } = await (0, connection_helpers_1.connectionHandler)(`${databaseName}/`, suppressAuth);
        return await database.listCollections(safeCollectionFilter, safeCollectionOptions).toArray();
    }
    catch (err) {
        throw new Error(`WeivData - Error when listing all collections in a database, details: ${err}`);
    }
}
exports.listCollections = listCollections;
