"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecretKey = getSecretKey;
const wix_secrets_backend_v2_1 = require("wix-secrets-backend.v2");
const secret_helpers_1 = require("./secret_helpers");
const crypto_1 = __importDefault(require("crypto"));
const error_manager_1 = require("../Errors/error_manager");
async function getSecretKey() {
    try {
        const cachedSecret = await (0, secret_helpers_1.getCachedSecret)("WeivDataURIEncryptSecret");
        if (cachedSecret) {
            return cachedSecret;
        }
        else {
            return await createRandomSecret();
        }
    }
    catch (err) {
        return await createRandomSecret();
    }
}
async function createRandomSecret() {
    try {
        const secret = {
            name: "WeivDataURIEncryptSecret",
            value: crypto_1.default.randomBytes(32).toString('hex'),
            description: "This is a secret key that's used when we are storing uris in cache to keep them secure. If you delete it system will create new one. Do not delete it!"
        };
        await wix_secrets_backend_v2_1.secrets.createSecret(secret);
        return secret.value;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when creating or getting URI secret key for (WeivDataURIEncryptSecret): ${err}`);
    }
}
