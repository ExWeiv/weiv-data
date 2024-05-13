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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelperSecretsCache = exports.getCachedSecret = void 0;
const wix_secrets_backend_v2_1 = require("wix-secrets-backend.v2");
const wixAuth = __importStar(require("wix-auth"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default();
const getSecretValue = wixAuth.elevate(wix_secrets_backend_v2_1.secrets.getSecretValue);
async function getCachedSecret(secretName, parse) {
    try {
        if (typeof secretName !== "string") {
            throw new Error(`Secret Name param is not string!`);
        }
        let secret = cache.get(secretName);
        if (secret === undefined) {
            const { value } = await getSecretValue(secretName);
            if (parse === true) {
                let objectSecret;
                try {
                    objectSecret = JSON.parse(value);
                }
                catch (err) {
                    throw new Error(`Failed to parse JSON for secret '${secretName}': ${err}`);
                }
                if (typeof objectSecret === 'object' && objectSecret !== null) {
                    secret = objectSecret;
                }
                else {
                    throw new Error(`Parsed JSON is not an object for secret '${secretName}'`);
                }
            }
            else {
                secret = value;
            }
            cache.set(secretName, secret, 60 * 6);
        }
        return secret;
    }
    catch (err) {
        throw Error(`WeivData - Error on general cached secret helpers: ${err}`);
    }
}
exports.getCachedSecret = getCachedSecret;
function getHelperSecretsCache() {
    return cache;
}
exports.getHelperSecretsCache = getHelperSecretsCache;
