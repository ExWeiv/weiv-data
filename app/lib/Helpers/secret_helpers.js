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
exports.getCachedSecret = getCachedSecret;
exports.getHelperSecretsCache = getHelperSecretsCache;
const wix_secrets_backend_v2_1 = require("wix-secrets-backend.v2");
const wixAuth = __importStar(require("wix-auth"));
const cacheable_1 = require("cacheable");
const error_manager_1 = require("../Errors/error_manager");
const cache = new cacheable_1.CacheableMemory({ useClone: false, ttl: undefined });
const getSecretValue = wixAuth.elevate(wix_secrets_backend_v2_1.secrets.getSecretValue);
async function getCachedSecret(secretName, parse) {
    try {
        if (typeof secretName !== "string") {
            (0, error_manager_1.kaptanLogar)("00014", "secretName param is not string!");
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
                    (0, error_manager_1.kaptanLogar)("00014", `failed to parse JSON for secret '${secretName}': ${err}`);
                }
                if (typeof objectSecret === 'object' && objectSecret !== null) {
                    secret = objectSecret;
                }
                else {
                    (0, error_manager_1.kaptanLogar)("00014", `parsed JSON is not an object for secret '${secretName}'`);
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
        (0, error_manager_1.kaptanLogar)("00014", `unexpected, ${err}`);
    }
}
function getHelperSecretsCache() {
    return cache;
}
