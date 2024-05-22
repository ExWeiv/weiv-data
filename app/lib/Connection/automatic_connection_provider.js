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
const clientCache = new node_cache_1.default({ useClones: false, stdTTL: 10 * 60, deleteOnExpire: true });
const statusCache = new node_cache_1.default({ useClones: false });
let listeners = false;
let manual = false;
async function setupClient(uri, role) {
    try {
        const cachedClient = clientCache.get(uri.slice(14, 40));
        if (cachedClient) {
            let connection = cachedClient;
            if (manual) {
                connection = await connectClient(cachedClient, uri);
            }
            if (connection) {
                return connection;
            }
            else {
                throw new Error(`there is a problem with client caching and it's a important problem please report it! This will directly impact to all operations`);
            }
        }
        else {
            return createNewClient(uri, role);
        }
    }
    catch (err) {
        throw new Error(`Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}
const createNewClient = async (uri, role) => {
    try {
        const options = await (0, connection_helpers_1.loadConnectionOptions)(role);
        if (options.minPoolSize || options.maxPoolSize) {
            manual = true;
        }
        const newMongoClient = new mongodb_1.MongoClient(uri, options);
        clientCache.set(uri.slice(14, 40), newMongoClient);
        let connection = newMongoClient;
        if (manual) {
            connection = await connectClient(newMongoClient, uri);
        }
        if (!listeners) {
            clientCache.on('expire', async (_key, client) => {
                client.removeAllListeners();
                await client.close();
                console.info("Client Expired and Connection Closed, Listeners Removed");
            });
            clientCache.on('del', async (_key, client) => {
                client.removeAllListeners();
                await client.close();
                console.info("Client Deleted and Connection Closed, Listeners Removed");
            });
            listeners = true;
        }
        if (connection) {
            return connection;
        }
        else {
            throw new Error(`Failed to connect to a MongoClient: connection: ${newMongoClient}`);
        }
    }
    catch (err) {
        throw new Error(`Error when creating a new MongoDB client: ${err}`);
    }
};
const listenersMap = new Map();
const connectClient = async (client, uri) => {
    try {
        const status = statusCache.get(uri.slice(14, 40));
        const cachedClient = clientCache.get(uri.slice(14, 40));
        if (status === true) {
            if (cachedClient) {
                return cachedClient;
            }
        }
        let connectedClient;
        if (!listenersMap.has(uri.slice(14, 40))) {
            const handleClose = async () => {
                clientCache.del(uri.slice(14, 40));
                statusCache.set(uri.slice(14, 40), false);
            };
            const handleError = async () => {
                clientCache.del(uri.slice(14, 40));
                statusCache.set(uri.slice(14, 40), false);
                throw new Error(`when trying to connect client (connection error): ${uri}`);
            };
            client.on('close', handleClose);
            client.on('error', handleError);
            listenersMap.set(uri.slice(14, 40), true);
        }
        connectedClient = await client.connect();
        clientCache.set(uri.slice(14, 40), connectedClient);
        statusCache.set(uri.slice(14, 40), true);
        return connectedClient;
    }
    catch (err) {
        throw new Error(`Unexpected error: ${err}`);
    }
};
async function useClient(suppressAuth = false) {
    try {
        const { uri, memberId, role } = await (0, permission_helpers_1.getMongoURI)(suppressAuth);
        const pool = await setupClient(uri, role);
        return { pool, memberId };
    }
    catch (err) {
        throw new Error(`when connecting to cached MongoClient via useClient: ${err}`);
    }
}
exports.useClient = useClient;
function getClientCache() {
    return clientCache;
}
exports.getClientCache = getClientCache;
