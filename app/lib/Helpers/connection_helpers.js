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
exports.connectionHandler = connectionHandler;
exports.loadConnectionOptions = loadConnectionOptions;
exports.getCustomCacheRules = getCustomCacheRules;
const customConnectionOptions = __importStar(require("../../../../../../../../../user-code/backend/WeivData/connection-options"));
const automatic_connection_provider_1 = require("../Connection/automatic_connection_provider");
const name_helpers_1 = require("./name_helpers");
const error_manager_1 = require("../Errors/error_manager");
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function connectionHandler(collectionId, suppressAuth = false) {
    try {
        if (!collectionId || typeof collectionId !== "string") {
            (0, error_manager_1.kaptanLogar)("00007");
        }
        let db;
        const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        const { pool, memberId } = await (0, automatic_connection_provider_1.useClient)(suppressAuth);
        if (dbName && typeof dbName === "string") {
            db = pool.db(dbName);
        }
        else {
            const { defaultDatabaseName } = (0, weiv_data_config_1.getWeivDataConfigs)();
            db = pool.db(defaultDatabaseName || "ExWeiv");
        }
        return { memberId, database: db, collection: db.collection(collectionName) };
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}
async function loadConnectionOptions(role) {
    try {
        if (role !== "adminClientOptions" && role !== "memberClientOptions" && role !== "visitorClientOptions") {
            (0, error_manager_1.kaptanLogar)("00009", "type of role is not string!");
        }
        const customOptions = customConnectionOptions[role];
        if (customOptions) {
            return await customOptions();
        }
        else {
            return {
                tls: true,
            };
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when returning options for MongoDB Client connection: ${err}`);
    }
}
async function getCustomCacheRules() {
    try {
        const cacheRules = customConnectionOptions["clientCacheRules"];
        if (cacheRules) {
            const loadedCacheRules = await cacheRules();
            return loadedCacheRules;
        }
        else {
            return { useClones: false };
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when loading custom cache rules for MongoClient connections ${err}`);
    }
}
