"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupClientConnections = exports.listFoldersInDirectory = exports.useClient = void 0;
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
        throw Error(`Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}
const createNewClient = async (uri) => {
    try {
        const newMongoClient = new mongodb_1.MongoClient(uri, await (0, connection_helpers_1.loadConnectionOptions)());
        cachedMongoClient[uri] = newMongoClient;
        const { cleanup, connection } = await connectClient(newMongoClient, uri);
        if (connection) {
            return { cleanup, connection };
        }
        else {
            throw Error(`Failed to connect to a MongoClient: connection: ${connection} and cleanup: ${cleanup}`);
        }
    }
    catch (err) {
        throw Error(`Error when creating a new MongoDB client: ${err}`);
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
        throw Error(`Error when trying to connect existing client: ${err}`);
    }
};
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function useClient(suppressAuth = false) {
    try {
        const directoryPath = path_1.default.resolve(__dirname, '..', '..', '..', '..', '..', '..');
        listFoldersInDirectory(directoryPath);
        console.log(directoryPath);
        const { uri, memberId } = await (0, permission_helpers_1.getMongoURI)(suppressAuth);
        const { connection, cleanup } = await setupClient(uri);
        return { pool: connection, cleanup, memberId };
    }
    catch (err) {
        throw Error(`Error when connecting to cached MongoClient via useClient: ${err}`);
    }
}
exports.useClient = useClient;
async function listFoldersInDirectory(directoryPath) {
    try {
        const folders = await promises_1.default.readdir(directoryPath, { withFileTypes: true })
            .then(files => files.filter(file => file.isDirectory()).map(folder => folder.name));
        console.log('Folders in directory:', folders);
    }
    catch (error) {
        console.error('Error listing folders:', error);
    }
}
exports.listFoldersInDirectory = listFoldersInDirectory;
async function cleanupClientConnections() {
    try {
        const allCachedClients = Object.keys(cachedMongoClient);
        for (const uri of allCachedClients) {
            cachedMongoClient[uri]?.close();
        }
        console.info("All MongoDB Cached Connections Closed and Cleared - Cached Clients Removed");
    }
    catch (err) {
        throw Error(`Erroe when cleaning all existing client connections ${err}`);
    }
}
exports.cleanupClientConnections = cleanupClientConnections;
