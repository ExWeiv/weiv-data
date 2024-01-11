"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupClientConnections = exports.useClient = void 0;
const mongodb_1 = require("mongodb");
const lodash_1 = __importDefault(require("lodash"));
const permission_helpers_1 = require("./permission_helpers");
const customOptions = {
    maxIdleTimeMS: 15000,
    maxPoolSize: 3
};
const getCustomOptions = () => {
    if (!process.env.MONGO_CLIENT_OPTIONS) {
        process.env.MONGO_CLIENT_OPTIONS = JSON.stringify(customOptions);
    }
    let customOptions = {};
    const defaultOptions = {
        tls: true,
        ssl: true,
        appName: "ExWeiv MongoDB Velo APIs",
        w: "majority",
        retryWrites: true
    };
    if (process.env.MONGO_CLIENT_OPTIONS) {
        customOptions = JSON.parse(process.env.MONGO_CLIENT_OPTIONS) || {};
    }
    return lodash_1.default.defaultsDeep(customOptions, defaultOptions);
};
const notConnectedPool = (err) => ({
    db: () => { throw err; },
    close: async () => { },
});
const emptyClient = () => ({
    connect: async () => notConnectedPool(new Error('No URI was provided')),
});
let savedClients = {};
async function setupClient(uri, newConnection = false) {
    if (newConnection) {
        const newClient = uri ? new mongodb_1.MongoClient(uri, getCustomOptions()) : emptyClient();
        lodash_1.default.set(savedClients, [uri, 'client'], newClient);
    }
    if (!savedClients[uri] && newConnection != true) {
        const newClient = uri ? new mongodb_1.MongoClient(uri, getCustomOptions()) : emptyClient();
        lodash_1.default.set(savedClients, [uri, 'client'], newClient);
    }
    const { pool, cleanup } = await savedClients[uri].client.connect()
        .then((res) => {
        return {
            pool: res,
            cleanup: async () => {
                delete savedClients[uri];
                await pool.close();
            }
        };
    }).catch(err => {
        return { pool: notConnectedPool(err), cleanup: async () => { } };
    });
    savedClients[uri].cleanup = async () => { await cleanup(); };
    return { pool, cleanup };
}
const memoizedSetupClient = lodash_1.default.memoize(setupClient);
async function useClient(suppressAuth = false) {
    const { uri, memberId } = await (0, permission_helpers_1.getMemberURI)(suppressAuth);
    if (savedClients[uri]) {
        const { pool, cleanup } = await memoizedSetupClient(uri, false);
        return { pool, cleanup, memberId };
    }
    else {
        const { pool, cleanup } = await setupClient(uri, true);
        return { pool, cleanup, memberId };
    }
}
exports.useClient = useClient;
async function cleanupClientConnections() {
    const clients = Object.keys(savedClients);
    if (clients.length > 0) {
        lodash_1.default.forEach(savedClients, async (data) => {
            if (data.cleanup)
                await data.cleanup();
        });
    }
    savedClients = {};
    console.log("All MongoDB Connections Closed and Cleared - Cached Clients Removed");
}
exports.cleanupClientConnections = cleanupClientConnections;
