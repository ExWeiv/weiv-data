"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientCache = exports.useClient = void 0;
const mongodb_1 = require("mongodb");
const permission_helpers_1 = require("./permission_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const node_cache_1 = __importDefault(require("node-cache"));
const clientCache = new node_cache_1.default({ useClones: false, stdTTL: 5 * 60, deleteOnExpire: true });
const statusCache = new node_cache_1.default({ useClones: false });
let listeners = false;
let manual = false;
async function setupClient(uri, role) {
    console.log("Setup Client: ", listeners, manual);
    try {
        const cachedClient = clientCache.get(uri.slice(0, 20));
        if (cachedClient) {
            let connection = cachedClient;
            if (manual) {
                connection = await connectClient(cachedClient, uri);
            }
            if (connection) {
                return connection;
            }
            else {
                throw Error(`There is a problem with client caching and it's a important problem please report it! This will directly impact to all operations`);
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
        const options = await (0, connection_helpers_1.loadConnectionOptions)(role);
        if (options.minPoolSize || options.maxPoolSize) {
            manual = true;
        }
        const newMongoClient = new mongodb_1.MongoClient(uri, options);
        clientCache.set(uri.slice(0, 20), newMongoClient);
        let connection = newMongoClient;
        if (manual) {
            connection = await connectClient(newMongoClient, uri);
        }
        if (!listeners) {
            clientCache.on('expire', async (_key, client) => {
                client.removeAllListeners();
                await client.close();
                console.log("Client Expired and Connection Closed, Listeners Removed");
            });
            clientCache.on('del', async (_key, client) => {
                client.removeAllListeners();
                await client.close();
                console.log("Client Deleted and Connection Closed, Listeners Removed");
            });
            listeners = true;
        }
        if (connection) {
            return connection;
        }
        else {
            throw Error(`WeivData - Failed to connect to a MongoClient: connection: ${newMongoClient}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when creating a new MongoDB client: ${err}`);
    }
};
const listenersMap = new Map();
const connectClient = async (client, uri) => {
    try {
        const status = statusCache.get(uri.slice(0, 20));
        const cachedClient = clientCache.get(uri.slice(0, 20));
        if (status === true) {
            if (cachedClient) {
                return cachedClient;
            }
        }
        let connectedClient;
        if (!listenersMap.has(uri.slice(0, 20))) {
            const handleClose = async () => {
                clientCache.del(uri.slice(0, 20));
                statusCache.set(uri.slice(0, 20), false);
            };
            const handleError = async () => {
                clientCache.del(uri.slice(0, 20));
                statusCache.set(uri.slice(0, 20), false);
                throw Error(`WeivData - Error when trying to connect client (connection error): ${uri}`);
            };
            client.on('close', handleClose);
            client.on('error', handleError);
            listenersMap.set(uri.slice(0, 20), true);
        }
        connectedClient = await client.connect();
        clientCache.set(uri.slice(0, 20), connectedClient);
        statusCache.set(uri.slice(0, 20), true);
        return connectedClient;
    }
    catch (err) {
        throw Error(`WeivData - Unexpected error: ${err}`);
    }
};
async function useClient(suppressAuth = false) {
    try {
        const { uri, memberId, role } = await (0, permission_helpers_1.getMongoURI)(suppressAuth);
        const pool = await setupClient(uri, role);
        return { pool, memberId };
    }
    catch (err) {
        throw Error(`WeivData - Error when connecting to cached MongoClient via useClient: ${err}`);
    }
}
exports.useClient = useClient;
function getClientCache() {
    return clientCache;
}
exports.getClientCache = getClientCache;
