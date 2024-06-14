"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissionsCache = exports.getMongoURI = void 0;
const wix_users_backend_1 = require("wix-users-backend");
const secret_helpers_1 = require("../Helpers/secret_helpers");
const node_cache_1 = __importDefault(require("node-cache"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const encrypt_helpers_1 = require("../Helpers/encrypt_helpers");
const log_helpers_1 = require("../Helpers/log_helpers");
const cache = new node_cache_1.default({ useClones: false, deleteOnExpire: true });
async function getMongoURI(suppressAuth = false) {
    try {
        (0, log_helpers_1.logMessage)("getMongoURI function called to get required connection uri based on visitor role");
        if (suppressAuth != true) {
            if (wix_users_backend_1.currentUser.loggedIn === true) {
                return getMemberURI();
            }
            else {
                return getVisitorURI();
            }
        }
        else {
            return getAdminURI();
        }
    }
    catch (err) {
        throw new Error(`Error on getting URI for MongoDB based on permission of current user: ${err}`);
    }
}
exports.getMongoURI = getMongoURI;
const getVisitorURI = async () => {
    try {
        (0, log_helpers_1.logMessage)(`We are searching connection uri for visitors`);
        const cachedEncryptedVisitorURI = cache.get("VisitorMongoDB_URI");
        if (cachedEncryptedVisitorURI) {
            const cachedVisitorURI = await decryptURI(cachedEncryptedVisitorURI);
            return { uri: cachedVisitorURI, role: "visitorClientOptions" };
        }
        const secret = await getSecretURI("visitor");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set("VisitorMongoDB_URI", encryptedURI, 60 * 5);
            return { uri: secret, role: "visitorClientOptions" };
        }
        else {
            throw new Error(`WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    }
    catch (err) {
        throw new Error(`Error when getting VisitorURI: ${err}`);
    }
};
const getAdminURI = async () => {
    try {
        (0, log_helpers_1.logMessage)(`We are searching connection uri for admins`);
        const cachedEncryptedAdminURI = cache.get("AdminMongoDB_URI");
        if (cachedEncryptedAdminURI) {
            const cachedAdminURI = await decryptURI(cachedEncryptedAdminURI);
            return {
                uri: cachedAdminURI,
                memberId: wix_users_backend_1.currentUser.id,
                role: "adminClientOptions"
            };
        }
        const secret = await getSecretURI("admin");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set("AdminMongoDB_URI", encryptedURI, 60 * 5);
            return {
                uri: secret,
                memberId: wix_users_backend_1.currentUser.id,
                role: "adminClientOptions"
            };
        }
        else {
            throw new Error(`WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    }
    catch (err) {
        throw new Error(`Error when getting AdminURI: ${err}`);
    }
};
const getMemberURI = async () => {
    try {
        (0, log_helpers_1.logMessage)(`We are searching connection uri for members`);
        const cachedEncryptedMemberURI = cache.get(`MemberURI${wix_users_backend_1.currentUser.id}`);
        if (cachedEncryptedMemberURI) {
            const cachedMemberURI = await decryptURI(cachedEncryptedMemberURI);
            (0, log_helpers_1.logMessage)(`We have found cached URI (members) so we are returning it`);
            return {
                uri: cachedMemberURI,
                memberId: wix_users_backend_1.currentUser.id,
                role: "memberClientOptions"
            };
        }
        (0, log_helpers_1.logMessage)(`We are now checking member roles to see if this member is an Admin?`);
        const cachedRole = cache.get(`MemberRoles${wix_users_backend_1.currentUser.id}`);
        if (cachedRole) {
            if (cachedRole === "Admin") {
                (0, log_helpers_1.logMessage)(`Member is Admin so we are getting admin URI not member URI`);
                return getAdminURI();
            }
        }
        const roles = await wix_users_backend_1.currentUser.getRoles();
        if (roles.length > 0) {
            cache.set(`MemberRoles${wix_users_backend_1.currentUser.id}`, roles[0].name, 60 * 5);
            const isAdmin = roles.filter((role) => {
                return role.name === "Admin";
            }).length > 0;
            if (isAdmin) {
                (0, log_helpers_1.logMessage)(`Member is Admin so we are getting admin URI not member URI, (role fetched via APIs)`);
                return getAdminURI();
            }
        }
        else {
            (0, log_helpers_1.logMessage)("We didn't find any specific (admin) role for this member, so we will return member URI.");
            cache.set(`MemberRoles${wix_users_backend_1.currentUser.id}`, "Member", 60 * 5);
        }
        const secret = await getSecretURI("member");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set(`MemberURI${wix_users_backend_1.currentUser.id}`, encryptedURI, 60 * 5);
            return {
                uri: secret,
                memberId: wix_users_backend_1.currentUser.id,
                role: "memberClientOptions"
            };
        }
        else {
            throw new Error(`WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    }
    catch (err) {
        throw new Error(`Error when getting MemberURI: ${err}`);
    }
};
function getPermissionsCache() {
    return cache;
}
exports.getPermissionsCache = getPermissionsCache;
const encryptURI = async (uri) => {
    const secret = await (0, encrypt_helpers_1.getSecretKey)();
    const encrypted = crypto_js_1.default.AES.encrypt(uri, secret, {
        mode: crypto_js_1.default.mode.CBC,
        paddding: crypto_js_1.default.pad.Pkcs7,
        iv: crypto_js_1.default.lib.WordArray.random(16)
    });
    return encrypted;
};
const decryptURI = async (encryptedURI) => {
    const secret = await (0, encrypt_helpers_1.getSecretKey)();
    const decrypted = crypto_js_1.default.AES.decrypt(encryptedURI, secret, {
        mode: crypto_js_1.default.mode.CBC,
        padding: crypto_js_1.default.pad.Pkcs7,
        iv: encryptedURI.iv
    });
    return decrypted.toString(crypto_js_1.default.enc.Utf8);
};
const getSecretURI = async (uri) => {
    try {
        (0, log_helpers_1.logMessage)(`getSecretURI working for ${uri}`);
        const secret = await (0, secret_helpers_1.getCachedSecret)("WeivDataURIs", true);
        return secret[uri];
    }
    catch (err) {
        throw new Error(`WeivData - Error when getting connection URI from secret manager via getCachedSecret helper function, ${err}`);
    }
};
