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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDataHook = runDataHook;
exports.runErrorHook = runErrorHook;
const data_hooks = __importStar(require("../../../../../../../../../user-code/backend/WeivData/data"));
const name_helpers_1 = require("../Helpers/name_helpers");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const error_manager_1 = require("../Errors/error_manager");
function hookExist(collectionId, hookName) {
    if (typeof hookName !== "string") {
        (0, error_manager_1.kaptanLogar)("00008");
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
        if (typeof hookName !== "string") {
            (0, error_manager_1.kaptanLogar)("00008");
        }
        if (typeof collectionId !== "string") {
            (0, error_manager_1.kaptanLogar)("00007");
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
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        runErrorHook(collectionId, new Error(`${err}`), context);
        throw new Error(`WeivData - Hook error: ${collectionId}, ${hookName}, err: ${err}`);
    }
}
function runErrorHook(collectionId, err, context) {
    console.error(err.message);
    const errorHandlerFunction = hookExist(collectionId, "onFailure");
    if (errorHandlerFunction) {
        errorHandlerFunction(err, context);
    }
}
