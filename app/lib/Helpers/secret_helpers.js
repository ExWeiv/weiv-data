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
const log_helpers_1 = require("./log_helpers");
const cache = new node_cache_1.default();
const getSecretValue = wixAuth.elevate(wix_secrets_backend_v2_1.secrets.getSecretValue);
async function getCachedSecret(secretName, parse) {
    try {
        if (typeof secretName !== "string") {
            throw new Error(`secretName param is not string!`);
        }
        let secret = cache.get(secretName);
        if (secret === undefined) {
            (0, log_helpers_1.logMessage)(`getCachedSecret function is called and as we check the cache we found nothing so we will get secret from the Wix Secret Manager`, secret);
            const { value } = await getSecretValue(secretName);
            (0, log_helpers_1.logMessage)(`We got the secret value from secret manager here it's first 3 char: ${value.slice(0, 3)}`);
            if (parse === true) {
                let objectSecret;
                try {
                    objectSecret = JSON.parse(value);
                }
                catch (err) {
                    throw new Error(`failed to parse JSON for secret '${secretName}': ${err}`);
                }
                if (typeof objectSecret === 'object' && objectSecret !== null) {
                    secret = objectSecret;
                }
                else {
                    throw new Error(`parsed JSON is not an object for secret '${secretName}'`);
                }
            }
            else {
                secret = value;
            }
            (0, log_helpers_1.logMessage)(`We are now saving found secret into cache so we don't need to get it from secret manager again and again`);
            cache.set(secretName, secret, 60 * 6);
        }
        return secret;
    }
    catch (err) {
        throw new Error(`Error on general cached secret helpers: ${err}`);
    }
}
exports.getCachedSecret = getCachedSecret;
function getHelperSecretsCache() {
    (0, log_helpers_1.logMessage)(`getHelperSecretsCache function is called and now we are returning secret cache`);
    return cache;
}
exports.getHelperSecretsCache = getHelperSecretsCache;
