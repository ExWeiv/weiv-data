"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConnectionOptions = exports.connectionHandler = void 0;
const connection_provider_1 = require("../Connection/connection_provider");
const name_helpers_1 = require("./name_helpers");
const secret_helpers_1 = require("./secret_helpers");
const lodash_1 = require("lodash");
const defaultOptions = {
    maxPoolSize: 40,
    minPoolSize: 1,
    maxIdleTimeMS: 30000
};
async function connectionHandler(collectionId, suppressAuth = false) {
    try {
        let db;
        const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        const { pool, cleanup, memberId } = await (0, connection_provider_1.useClient)(suppressAuth);
        if (dbName) {
            db = pool.db(dbName);
        }
        else {
            db = pool.db("exweiv");
        }
        const collection = db.collection(collectionName);
        return { collection, cleanup, memberId };
    }
    catch (err) {
        throw Error(`WeivData - Error when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}
exports.connectionHandler = connectionHandler;
async function loadConnectionOptions() {
    try {
        const optionsSecret = await (0, secret_helpers_1.getCachedSecret)("WeivDataConnectionOptions");
        if (optionsSecret) {
            let customOptions = optionsSecret;
            if (customOptions) {
                if (typeof customOptions === "string") {
                    customOptions = await JSON.parse(customOptions);
                }
                return (0, lodash_1.defaultsDeep)(defaultOptions, customOptions);
            }
            else {
                return defaultOptions;
            }
        }
        else {
            return defaultOptions;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when returning options for MongoDB Client connection: ${err}`);
    }
}
exports.loadConnectionOptions = loadConnectionOptions;
