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
exports.runDataHook = void 0;
const data_hooks = __importStar(require("../../../../../../../../../user-code/backend/WeivData/data"));
const name_helpers_1 = require("../Helpers/name_helpers");
function hookExist(collectionId, hookName) {
    if (typeof hookName !== "string") {
        throw new Error("type of hook name is not string!");
    }
    const { collectionName, dbName } = (0, name_helpers_1.splitCollectionId)(collectionId);
    const hook = data_hooks[`${dbName.toLowerCase()}_${collectionName.toLowerCase()}_${hookName}`];
    if (hook) {
        return hook;
    }
    else {
        return undefined;
    }
}
async function runDataHook(collectionId, hookName, args) {
    try {
        if (typeof hookName !== "string" && typeof collectionId !== "string") {
            throw new Error("type of hook name or collection id is not string!");
        }
        const hookFunction = hookExist(collectionId, hookName);
        if (hookFunction) {
            const item = await hookFunction(...args);
            return item;
        }
        else {
            return undefined;
        }
    }
    catch (err) {
        const errorHandlerFunction = hookExist(collectionId, "onFailure");
        if (errorHandlerFunction) {
            errorHandlerFunction(err);
        }
        throw Error(`WeivData - Hook error: ${collectionId}, ${hookName}, err: ${err}`);
    }
}
exports.runDataHook = runDataHook;
