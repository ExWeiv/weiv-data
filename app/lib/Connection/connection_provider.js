"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionClientsCache = exports.cleanupClientConnections = exports.useClient = void 0;
const mongodb_1 = require("mongodb");
const permission_helpers_1 = require("./permission_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const cachedMongoClient = {};
const cachedConnectionStatus = {};
async function setupClient(uri, role) {
    try {
        if (cachedMongoClient[uri]) {
            const { connection, cleanup } = await connectClient(cachedMongoClient[uri], uri);
            if (connection) {
                return { connection, cleanup };
            }
            else {
                console.warn("WeivData - Failed to connect/create MongoClient in first attempt!");
                const newMongoClient = new mongodb_1.MongoClient(uri, await (0, connection_helpers_1.loadConnectionOptions)(role));
                cachedMongoClient[uri] = newMongoClient;
                const secondAttempt = await connectClient(newMongoClient, uri);
                if (!secondAttempt.connection) {
                    throw Error("WeivData - Failed both two attempts to connect to a MongoClient");
                }
                else {
                    return { connection: secondAttempt.connection, cleanup: secondAttempt.cleanup };
                }
            }
        }
        else {
            return createNewClient(uri, role);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}
const createNewClient = async (uri, role) => {
    try {
        const newMongoClient = new mongodb_1.MongoClient(uri, await (0, connection_helpers_1.loadConnectionOptions)(role));
        cachedMongoClient[uri] = newMongoClient;
        const { cleanup, connection } = await connectClient(newMongoClient, uri);
        if (connection) {
            return { cleanup, connection };
        }
        else {
            throw Error(`WeivData - Failed to connect to a MongoClient: connection: ${connection} and cleanup: ${cleanup}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when creating a new MongoDB client: ${err}`);
    }
};
const connectClient = async (client, uri) => {
    try {
        if (cachedConnectionStatus[uri] === true) {
            return {
                connection: cachedMongoClient[uri],
                cleanup: () => { cachedMongoClient[uri]?.close(); }
            };
        }
        let connectedClient;
        const handleOpen = async () => {
            cachedMongoClient[uri] = connectedClient;
            cachedConnectionStatus[uri] = true;
        };
        const handleClose = async () => {
            await cachedMongoClient[uri].close();
            cachedMongoClient[uri].removeAllListeners();
            delete cachedMongoClient[uri];
            cachedConnectionStatus[uri] = false;
        };
        const handleError = async () => {
            await client.close();
            client.removeAllListeners();
            throw Error(`WeivData - Error when trying to connect client: ${uri}`);
        };
        client.on('open', handleOpen);
        client.on('close', handleClose);
        client.on('error', handleError);
        connectedClient = await client.connect();
        return {
            connection: connectedClient,
            cleanup: () => { connectedClient.close(); }
        };
    }
    catch (err) {
        throw Error(`WeivData - Unexpected error: ${err}`);
    }
};
async function useClient(suppressAuth = false) {
    try {
        const { uri, memberId, role } = await (0, permission_helpers_1.getMongoURI)(suppressAuth);
        const { connection, cleanup } = await setupClient(uri, role);
        return { pool: connection, cleanup, memberId };
    }
    catch (err) {
        throw Error(`WeivData - Error when connecting to cached MongoClient via useClient: ${err}`);
    }
}
exports.useClient = useClient;
async function cleanupClientConnections() {
    try {
        const allCachedClients = Object.keys(cachedMongoClient);
        for (const uri of allCachedClients) {
            cachedMongoClient[uri]?.close();
            cachedConnectionStatus[uri] = false;
            delete cachedMongoClient[uri];
        }
        console.info("All MongoDB Cached Connections Closed and Cleared - Cached Clients Removed");
    }
    catch (err) {
        throw Error(`WeivData - Error when cleaning all existing client connections ${err}`);
    }
}
exports.cleanupClientConnections = cleanupClientConnections;
function getConnectionClientsCache() {
    return "ConnectionClients";
}
exports.getConnectionClientsCache = getConnectionClientsCache;
