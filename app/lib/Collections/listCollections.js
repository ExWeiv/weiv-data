"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCollections = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
async function listCollections(databaseName, options, filter, listOptions) {
    try {
        if (!databaseName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: databaseName`);
        }
        const { suppressAuth } = options || {};
        const { database } = await (0, connection_helpers_1.connectionHandler)(`${databaseName}/`, suppressAuth, true);
        return await database.listCollections(filter, listOptions).toArray();
    }
    catch (err) {
        throw Error(`WeivData - Error when listing all collections in a database, details: ${err}`);
    }
}
exports.listCollections = listCollections;
