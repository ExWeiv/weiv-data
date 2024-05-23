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
const log_helpers_1 = require("../Helpers/log_helpers");
const clientCache = new node_cache_1.default({ useClones: false });
let nodeCacheListeners = false;
async function setupClient(uri, role) {
    try {
        const cachedClient = clientCache.get(uri.slice(14, 40));
        if (cachedClient) {
            (0, log_helpers_1.logMessage)("There is a cached MongoClient so we are returning this MongoClient.");
            return cachedClient;
        }
        else {
            (0, log_helpers_1.logMessage)("There isn't any cached MongoClient, we will create new one now.");
            return createNewClient(uri, role);
        }
    }
    catch (err) {
        throw new Error(`Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}
const createNewClient = async (uri, role) => {
    try {
        (0, log_helpers_1.logMessage)(`Creating new MongoClient for URI: ${uri.slice(14, 40)} with role: ${role}`);
        const options = await (0, connection_helpers_1.loadConnectionOptions)(role);
        const newMongoClient = new mongodb_1.MongoClient(uri, options);
        await connectClient(newMongoClient, uri);
        if (!nodeCacheListeners) {
            (0, log_helpers_1.logMessage)("We didn't set any NodeCache listeners before so we will create event listeners for NodeCache expire/deletion.");
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
            nodeCacheListeners = true;
        }
        (0, log_helpers_1.logMessage)("New MongoClient is created and now returned with createNewClient function", { uri: uri.slice(14, 40), role });
        return newMongoClient;
    }
    catch (err) {
        throw new Error(`Error when creating a new MongoDB client: ${err}`);
    }
};
const listenersMap = new Map();
const connectClient = async (client, uri) => {
    try {
        (0, log_helpers_1.logMessage)("connectClient function is called to connect created MongoClient");
        if (!listenersMap.has(uri.slice(14, 40))) {
            (0, log_helpers_1.logMessage)("Setting up MongoClient event listeners for close/error events, (for this specific MongoClient).");
            const handleClose = async () => {
                clientCache.del(uri.slice(14, 40));
            };
            const handleError = async () => {
                clientCache.del(uri.slice(14, 40));
                throw new Error(`when trying to connect client (connection error): ${uri.slice(14, 40)}`);
            };
            client.on('close', handleClose);
            client.on('error', handleError);
            listenersMap.set(uri.slice(14, 40), true);
        }
        await client.connect();
        clientCache.set(uri.slice(14, 40), client);
        (0, log_helpers_1.logMessage)("We have now connected to a node via .connect method of existing MongoClient that sent via params to connectClient function. And client is returned.");
        return client;
    }
    catch (err) {
        throw new Error(`Unexpected error when connecting MongoClient and setting listerners for MongoClient: ${err}`);
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
