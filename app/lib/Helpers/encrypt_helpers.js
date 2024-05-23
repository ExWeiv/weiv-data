"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecretKey = void 0;
const wix_secrets_backend_v2_1 = require("wix-secrets-backend.v2");
const crypto_1 = __importDefault(require("crypto"));
const secret_helpers_1 = require("./secret_helpers");
const log_helpers_1 = require("./log_helpers");
async function getSecretKey() {
    try {
        (0, log_helpers_1.logMessage)(`getSecretKey is called and now we will get the secret key to encrypt or decrypt connection URIs when saving them to cache for better security`);
        const cachedSecret = await (0, secret_helpers_1.getCachedSecret)("WeivDataURIEncryptSecret");
        if (cachedSecret) {
            return cachedSecret;
        }
        else {
            const secret = {
                name: "WeivDataURIEncryptSecret",
                value: crypto_1.default.randomBytes(32).toString('hex'),
                description: "This is a secret key that's used when we are storing uris in cache to keep them secure. If you delete it system will create new one. Do not delete it!"
            };
            await wix_secrets_backend_v2_1.secrets.createSecret(secret);
            return secret.value;
        }
    }
    catch (err) {
        throw new Error(`Error when creating or getting URI secret key: ${err}`);
    }
}
exports.getSecretKey = getSecretKey;
