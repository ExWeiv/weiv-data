"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomCacheRules = exports.loadConnectionOptions = exports.connectionHandler = void 0;
const customConnectionOptions = __importStar(require("../../../../../../../../../user-code/backend/WeivData/connection-options"));
const automatic_connection_provider_1 = require("../Connection/automatic_connection_provider");
const name_helpers_1 = require("./name_helpers");
const log_helpers_1 = require("./log_helpers");
async function connectionHandler(collectionId, suppressAuth = false) {
    try {
        if (!collectionId || typeof collectionId !== "string") {
            throw new Error(`WeivData - Error when trying to connect to MongoClient, collectionId must be a string!`);
        }
        (0, log_helpers_1.logMessage)(`Connection Handler called via this collectionId: ${collectionId} and suppressAuth: ${suppressAuth}`);
        let db;
        const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        const { pool, memberId } = await (0, automatic_connection_provider_1.useClient)(suppressAuth);
        if (dbName && typeof dbName === "string") {
            db = pool.db(dbName);
        }
        else {
            db = pool.db("ExWeiv");
        }
        return { memberId, database: db, collection: db.collection(collectionName) };
    }
    catch (err) {
        throw new Error(`when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}
exports.connectionHandler = connectionHandler;
async function loadConnectionOptions(role) {
    try {
        if (role !== "adminClientOptions" && role !== "memberClientOptions" && role !== "visitorClientOptions") {
            throw new Error("type of role is not string!");
        }
        (0, log_helpers_1.logMessage)(`Loading custom connection options for MongoClient for role ${role}`);
        const customOptions = customConnectionOptions[role];
        if (customOptions) {
            (0, log_helpers_1.logMessage)(`There are some custom options so loading them! for role ${role}`);
            return await customOptions();
        }
        else {
            (0, log_helpers_1.logMessage)(`There isn't any custom option loading default options for role ${role}`);
            return {
                tls: true,
            };
        }
    }
    catch (err) {
        throw new Error(`when returning options for MongoDB Client connection: ${err}`);
    }
}
exports.loadConnectionOptions = loadConnectionOptions;
async function getCustomCacheRules() {
    try {
        (0, log_helpers_1.logMessage)(`Getting custom cache rules for MongoClient caching via Node-Cache`);
        const cacheRules = customConnectionOptions["clientCacheRules"];
        if (cacheRules) {
            const loadedCacheRules = await cacheRules();
            (0, log_helpers_1.logMessage)(`There are some custom cache rules so loading them`, loadedCacheRules);
            return loadedCacheRules;
        }
        else {
            (0, log_helpers_1.logMessage)(`There isn't any custom cache rule so loading default rules`);
            return { useClones: false };
        }
    }
    catch (err) {
        throw new Error(`when loading custom cache rules for MongoClient connections, err: ${err}`);
    }
}
exports.getCustomCacheRules = getCustomCacheRules;
