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
const statusCache = new node_cache_1.default({ useClones: false });
let listeners = false;
let manual = false;
async function setupClient(uri, role) {
    try {
        (0, log_helpers_1.logMessage)(`Setting up a new or existing MongoClient for database a operation, for role: ${role} with URI: ${uri.slice(14, 40)} (URI is sliced for security reasons)`);
        const cachedClient = clientCache.get(uri.slice(14, 40));
        if (cachedClient) {
            (0, log_helpers_1.logMessage)(`We have found a cached MongoClient so we will use it instead of creating new one!`, cachedClient);
            let connection = cachedClient;
            if (manual) {
                (0, log_helpers_1.logMessage)(`Since there are some custom connection options that effects to connection pool we will call connectClient to be safe, manual: ${manual}`, connection);
                connection = await connectClient(cachedClient, uri);
            }
            if (connection) {
                (0, log_helpers_1.logMessage)(`Connection of MongoClient is ready and now returned with setupClient function`, connection);
                return connection;
            }
            else {
                throw new Error(`there is a problem with client caching and it's a important problem please report it! This will directly impact to all operations`);
            }
        }
        else {
            (0, log_helpers_1.logMessage)(`No cached MongoClients found so we are creating new MongoClient for role: ${role} with URI: ${uri.slice(14, 40)}`);
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
        if (options.minPoolSize || options.maxPoolSize) {
            (0, log_helpers_1.logMessage)(`There are some options for MongoClient (either minPoolSize or maxPoolSize) that effects to connection pool so we set manual to true`, options);
            manual = true;
        }
        const newMongoClient = new mongodb_1.MongoClient(uri, options);
        clientCache.set(uri.slice(14, 40), newMongoClient);
        (0, log_helpers_1.logMessage)(`New MongoClient created with selected options and URI`, newMongoClient);
        let connection = newMongoClient;
        if (manual) {
            (0, log_helpers_1.logMessage)(`Since manual is enabled we will connect to MongoDB so we are calling connectClient`, connection);
            connection = await connectClient(newMongoClient, uri);
        }
        if (!listeners) {
            (0, log_helpers_1.logMessage)(`We didn't set any listerners for MongoClient to clear event listeners so we are setting event listeners, value: ${!listeners}`);
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
            (0, log_helpers_1.logMessage)(`Newly created and connected MongoClient is now returned with createNewClient function!`, connection);
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
        (0, log_helpers_1.logMessage)(`connectClient function is called with this URI: ${uri.slice(14, 40)}`, client);
        const status = statusCache.get(uri.slice(14, 40));
        const cachedClient = clientCache.get(uri.slice(14, 40));
        if (status === true) {
            (0, log_helpers_1.logMessage)(`Status cache is filled so it's true`);
            if (cachedClient) {
                (0, log_helpers_1.logMessage)(`There is also cached MongoClient so it's also true and we are returning the cached MongoClient`);
                return cachedClient;
            }
        }
        (0, log_helpers_1.logMessage)(`Creating new MongoClient inside connectClient function since we don't have any in cache`);
        if (!listenersMap.has(uri.slice(14, 40))) {
            (0, log_helpers_1.logMessage)(`Setting up MongoClient event listeners for close and error events`);
            const handleClose = async () => {
                clientCache.del(uri.slice(14, 40));
                statusCache.set(uri.slice(14, 40), false);
            };
            const handleError = async () => {
                clientCache.del(uri.slice(14, 40));
                statusCache.set(uri.slice(14, 40), false);
                throw new Error(`when trying to connect client (connection error): ${uri.slice(14, 40)}`);
            };
            client.on('close', handleClose);
            client.on('error', handleError);
            listenersMap.set(uri.slice(14, 40), true);
        }
        await client.connect();
        (0, log_helpers_1.logMessage)(`We have now connected to MongoClient via .connect method`, client);
        clientCache.set(uri.slice(14, 40), client);
        statusCache.set(uri.slice(14, 40), true);
        (0, log_helpers_1.logMessage)(`We have saved client and status to cache so we won't create new MongoClient/s for each call. And we return the connectedClient`, { clientCache, statusCache });
        return client;
    }
    catch (err) {
        throw new Error(`Unexpected error: ${err}`);
    }
};
async function useClient(suppressAuth = false) {
    try {
        (0, log_helpers_1.logMessage)(`useClient function is called and now we will first get the connection URI and then setup the MongoClient via setupClient, permission bypass is: ${suppressAuth}`);
        const { uri, memberId, role } = await (0, permission_helpers_1.getMongoURI)(suppressAuth);
        const pool = await setupClient(uri, role);
        (0, log_helpers_1.logMessage)(`useClient job has completed and now we return the MongoClient and memberId is exists`, { memberId, client: pool });
        return { pool, memberId };
    }
    catch (err) {
        throw new Error(`when connecting to cached MongoClient via useClient: ${err}`);
    }
}
exports.useClient = useClient;
function getClientCache() {
    (0, log_helpers_1.logMessage)(`MongoClient cache is requested`, clientCache);
    return clientCache;
}
exports.getClientCache = getClientCache;
