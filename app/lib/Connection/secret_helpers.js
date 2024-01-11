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
exports.getCachedSecret = void 0;
const wix_secrets_backend_v2_1 = require("wix-secrets-backend.v2");
const wixAuth = __importStar(require("wix-auth"));
const getSecretValue = wixAuth.elevate(wix_secrets_backend_v2_1.secrets.getSecretValue);
async function getCachedSecret(secretName) {
    try {
        let secret = global[secretName.toUpperCase()];
        if (!secret || secret === null || secret === undefined) {
            secret = await getSecretValue(secretName);
            global[secretName.toUpperCase()] = secret;
        }
        return secret;
    }
    catch (err) {
        console.error("Error on getting cached secret", err);
        const visitorURI = await getSecretValue("visitorURI");
        return visitorURI;
    }
}
exports.getCachedSecret = getCachedSecret;
