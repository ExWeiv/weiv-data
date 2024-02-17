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
const clientCache = new node_cache_1.default({ deleteOnExpire: true });
let expireListener = false;
async function setupClient(uri, role) {
    try {
        const cachedClient = clientCache.get(uri.substring(0, 19));
        console.log("Cached Client", cachedClient, uri.substring(0, 19));
        if (cachedClient) {
            // If there is a cached client then return it.
            return cachedClient;
        }
        else {
            // If there are no clients in cache create new one and return.
            return createNewClient(uri, role);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}
const createNewClient = async (uri, role) => {
    try {
        // Create a client and save it to cache
        const newMongoClient = new mongodb_1.MongoClient(uri, await (0, connection_helpers_1.loadConnectionOptions)(role));
        clientCache.set(uri.substring(0, 19), newMongoClient, 60 * 5);
        if (!expireListener) {
            clientCache.on('expired', async (_key, value) => {
                await value.close();
            });
        }
        return newMongoClient;
    }
    catch (err) {
        throw Error(`WeivData - Error when creating a new MongoDB client: ${err}`);
    }
};
/**@internal */
async function useClient(suppressAuth = false) {
    try {
        const { uri, memberId, role } = await (0, permission_helpers_1.getMongoURI)(suppressAuth);
        const managedClient = await setupClient(uri, role);
        return { pool: managedClient, memberId };
    }
    catch (err) {
        throw Error(`WeivData - Error when connecting to cached MongoClient via useClient: ${err}`);
    }
}
exports.useClient = useClient;
/**@internal */
function getClientCache() {
    return clientCache;
}
exports.getClientCache = getClientCache;
