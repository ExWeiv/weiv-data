"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionHandler = void 0;
const connection_provider_1 = require("../Connection/connection_provider");
const name_helpers_1 = require("./name_helpers");
async function connectionHandler(collectionId, suppressAuth = false) {
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
exports.connectionHandler = connectionHandler;
