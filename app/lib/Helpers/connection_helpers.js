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
exports.loadConnectionOptions = exports.connectionHandler = void 0;
const customConnectionOptions = __importStar(require("../../../../../../../../../user-code/backend/WeivData/connection-options"));
const automatic_connection_provider_1 = require("../Connection/automatic_connection_provider");
const name_helpers_1 = require("./name_helpers");
const defaultOptions = {
    tls: true,
};
async function connectionHandler(collectionId, suppressAuth = false) {
    try {
        let db;
        const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
        const { pool, memberId } = await (0, automatic_connection_provider_1.useClient)(suppressAuth);
        if (dbName) {
            db = pool.db(dbName);
        }
        else {
            db = pool.db("ExWeiv");
        }
        const collection = db.collection(collectionName);
        return { collection, memberId };
    }
    catch (err) {
        throw Error(`WeivData - Error when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}
exports.connectionHandler = connectionHandler;
async function loadConnectionOptions(role) {
    try {
        const customOptions = customConnectionOptions[role];
        if (customOptions) {
            return customOptions;
        }
        else {
            return defaultOptions;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when returning options for MongoDB Client connection: ${err}`);
    }
}
exports.loadConnectionOptions = loadConnectionOptions;
