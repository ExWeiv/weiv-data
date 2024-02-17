"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecretKey = void 0;
const crypto_1 = __importDefault(require("crypto")); //@ts-ignore
const wix_secrets_backend_v2_1 = require("wix-secrets-backend.v2");
const secret_helpers_1 = require("./secret_helpers");
/**@internal */
async function getSecretKey() {
    try {
        const secret = {
            name: "WeivDataURIEncryptSecret",
            value: crypto_1.default.randomBytes(32).toString('hex'),
            description: "This is a secret key that's used when we are storing uris in cache to keep them secure. If you delete it system will create new one. Do not delete it!"
        };
        const cachedSecret = await (0, secret_helpers_1.getCachedSecret)("WeivDataURIEncryptSecret");
        if (cachedSecret) {
            return cachedSecret;
        }
        else {
            await wix_secrets_backend_v2_1.secrets.createSecret(secret);
            return secret.value;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when creating or getting URI secret key: ${err}`);
    }
}
exports.getSecretKey = getSecretKey;
