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
const crypto_1 = __importDefault(require("crypto"));
const encrypt_helpers_1 = require("../Helpers/encrypt_helpers");
const clientCache = new node_cache_1.default({ deleteOnExpire: true });
let expireListener = false;
async function setupClient(uri, role) {
    try {
        const cachedClient = clientCache.get(await encryptURI(uri));
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
        clientCache.set(await encryptURI(uri), newMongoClient, 60 * 5);
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
const encryptURI = async (uri) => {
    const secret = await (0, encrypt_helpers_1.getSecretKey)();
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
    let encrypted = cipher.update(uri, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};
/**@internal */
function getClientCache() {
    return clientCache;
}
exports.getClientCache = getClientCache;
