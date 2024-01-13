"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupClientConnections = exports.useClient = void 0;
const mongodb_1 = require("mongodb");
const permission_helpers_1 = require("./permission_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const cachedMongoClient = {};
async function setupClient(uri) {
    try {
        if (cachedMongoClient[uri]) {
            const { connection, cleanup } = await connectClient(cachedMongoClient[uri], uri);
            if (connection) {
                return { connection, cleanup };
            }
            else {
                console.warn("Failed to connect/create MongoClient in first attempt!");
                const newMongoClient = new mongodb_1.MongoClient(uri, await (0, connection_helpers_1.loadConnectionOptions)());
                cachedMongoClient[uri] = newMongoClient;
                const secondAttempt = await connectClient(newMongoClient, uri);
                if (!secondAttempt.connection) {
                    throw Error("Failed both two attempts to connect to a MongoClient");
                }
                else {
                    return { connection: secondAttempt.connection, cleanup: secondAttempt.cleanup };
                }
            }
        }
        else {
            return createNewClient(uri);
        }
    }
    catch (err) {
        console.error("Error when returning from setupClient function", err);
        return createNewClient(uri);
    }
}
const createNewClient = async (uri) => {
    const newMongoClient = new mongodb_1.MongoClient(uri, await (0, connection_helpers_1.loadConnectionOptions)());
    cachedMongoClient[uri] = newMongoClient;
    const { cleanup, connection } = await connectClient(newMongoClient, uri);
    if (connection) {
        return { cleanup, connection };
    }
    else {
        throw Error("Failed to connect to a MongoClient");
    }
};
const connectClient = async (client, uri) => {
    try {
        const connectedClient = await client.connect();
        return {
            connection: connectedClient,
            cleanup: () => { cachedMongoClient[uri]?.close(); }
        };
    }
    catch (err) {
        console.error("Failed to connect (MongoClient)", err);
        return {
            connection: undefined,
            cleanup: () => { cachedMongoClient[uri]?.close(); }
        };
    }
};
async function useClient(suppressAuth = false) {
    const { uri, memberId } = await (0, permission_helpers_1.getMongoURI)(suppressAuth);
    const { connection, cleanup } = await setupClient(uri.value);
    return { pool: connection, cleanup, memberId };
}
exports.useClient = useClient;
async function cleanupClientConnections() {
    const allCachedClients = Object.keys(cachedMongoClient);
    for (const uri of allCachedClients) {
        cachedMongoClient[uri]?.close();
    }
    console.log("All MongoDB Cached Connections Closed and Cleared - Cached Clients Removed");
}
exports.cleanupClientConnections = cleanupClientConnections;
