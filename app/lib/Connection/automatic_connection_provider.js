"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useClient = useClient;
exports.getClientCache = getClientCache;
const mongodb_1 = require("mongodb");
const permission_helpers_1 = require("./permission_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const node_cache_1 = __importDefault(require("node-cache"));
const error_manager_1 = require("../Errors/error_manager");
const clientCache = new node_cache_1.default({ useClones: false });
let nodeCacheListeners = false;
async function setupClient(uri, role) {
    try {
        const cachedClient = clientCache.get(uri.slice(14, 40));
        if (cachedClient) {
            return cachedClient;
        }
        else {
            return createNewClient(uri, role);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when connecting to MongoDB Client via setupClient: ${err}`);
    }
}
const createNewClient = async (uri, role) => {
    try {
        const options = await (0, connection_helpers_1.loadConnectionOptions)(role);
        const newMongoClient = new mongodb_1.MongoClient(uri, options);
        await connectClient(newMongoClient, uri);
        if (!nodeCacheListeners) {
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
        return newMongoClient;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when creating a new MongoDB client: ${err}`);
    }
};
const listenersMap = new Map();
const connectClient = async (client, uri) => {
    try {
        if (!listenersMap.has(uri.slice(14, 40))) {
            const handleClose = async () => {
                clientCache.del(uri.slice(14, 40));
            };
            const handleError = async () => {
                clientCache.del(uri.slice(14, 40));
                (0, error_manager_1.kaptanLogar)("00009", `when trying to connect client (connection error): ${uri.slice(14, 40)}`);
            };
            client.on('close', handleClose);
            client.on('error', handleError);
            listenersMap.set(uri.slice(14, 40), true);
        }
        await client.connect();
        clientCache.set(uri.slice(14, 40), client);
        return client;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `Unexpected error when connecting MongoClient and setting listerners for MongoClient: ${err}`);
    }
};
async function useClient(suppressAuth = false) {
    try {
        const { uri, memberId, role } = await (0, permission_helpers_1.getMongoURI)(suppressAuth);
        const pool = await setupClient(uri, role);
        return { pool, memberId };
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when connecting to cached MongoClient via useClient: ${err}`);
    }
}
function getClientCache() {
    return clientCache;
}
