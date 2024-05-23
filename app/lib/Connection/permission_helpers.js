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
        await (0, log_helpers_1.logMessage)(`getMongoURI function is called, now we will find the required MongoDB connection uri and return it for current request, either frmo cache or secrets, permission bypass: ${suppressAuth}`);
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
        await (0, log_helpers_1.logMessage)(`We are searching connection uri for visitors`);
        const cachedEncryptedVisitorURI = cache.get("VisitorMongoDB_URI");
        if (cachedEncryptedVisitorURI) {
            await (0, log_helpers_1.logMessage)(`We have found cached URI (visitors) so we are returning it`);
            const cachedVisitorURI = await decryptURI(cachedEncryptedVisitorURI);
            return { uri: cachedVisitorURI, role: "visitorClientOptions" };
        }
        const secret = await getSecretURI("visitor");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set("VisitorMongoDB_URI", encryptedURI, 60 * 5);
            await (0, log_helpers_1.logMessage)(`We didn't find any connection URI in cache so we got it from secrets manager and now we are returning it (visitors)`);
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
        await (0, log_helpers_1.logMessage)(`We are searching connection uri for admins`);
        const cachedEncryptedAdminURI = cache.get("AdminMongoDB_URI");
        if (cachedEncryptedAdminURI) {
            const cachedAdminURI = await decryptURI(cachedEncryptedAdminURI);
            await (0, log_helpers_1.logMessage)(`We have found cached URI (admins) so we are returning it`);
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
            await (0, log_helpers_1.logMessage)(`We didn't find any connection URI in cache so we got it from secrets manager and now we are returning it (admins)`);
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
        await (0, log_helpers_1.logMessage)(`We are searching connection uri for members`);
        const cachedEncryptedMemberURI = cache.get(`MemberMongoDB_URI${wix_users_backend_1.currentUser.id}`);
        if (cachedEncryptedMemberURI) {
            const cachedMemberURI = await decryptURI(cachedEncryptedMemberURI);
            await (0, log_helpers_1.logMessage)(`We have found cached URI (members) so we are returning it`);
            return {
                uri: cachedMemberURI,
                memberId: wix_users_backend_1.currentUser.id,
                role: "memberClientOptions"
            };
        }
        await (0, log_helpers_1.logMessage)(`We are now checking member roles to see if this member is an Admin?`);
        const cachedRole = cache.get(`MemberRoles${wix_users_backend_1.currentUser.id}`);
        if (cachedRole) {
            await (0, log_helpers_1.logMessage)(`We found cached role for this member, cached role: ${cachedRole}`);
            if (cachedRole === "Admin") {
                await (0, log_helpers_1.logMessage)(`Member is Admin so we are getting admin URI not member URI for MongoDB`);
                return getAdminURI();
            }
        }
        await (0, log_helpers_1.logMessage)(`We didn't find any roles in cache so we are searching in Wix Members area via wix-users-backend APIs`);
        const roles = await wix_users_backend_1.currentUser.getRoles();
        if (roles.length > 0) {
            await (0, log_helpers_1.logMessage)(`There are some roles belongs to current member so we are saving them to cache`, roles);
            cache.set(`MemberRoles${wix_users_backend_1.currentUser.id}`, roles[0].name, 60 * 5);
            const isAdmin = roles.filter((role) => {
                return role.name === "Admin";
            }).length > 0;
            if (isAdmin) {
                await (0, log_helpers_1.logMessage)(`Member is Admin so we are getting admin URI not member URI for MongoDB, (role is searched via API)`);
                return getAdminURI();
            }
        }
        else {
            await (0, log_helpers_1.logMessage)(`We didn't find any roles belongs to this user so we save this user as a normal member`, roles);
            cache.set(`MemberRoles${wix_users_backend_1.currentUser.id}`, "Member", 60 * 5);
        }
        const secret = await getSecretURI("member");
        if (secret) {
            await (0, log_helpers_1.logMessage)(`We got the connection URI via getSecretURI function and now we are saving it to cache and returning it`);
            const encryptedURI = await encryptURI(secret);
            cache.set(`MemberMongoDB_URI${wix_users_backend_1.currentUser.id}`, encryptedURI, 60 * 5);
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
        await (0, log_helpers_1.logMessage)(`getSecretURI working for ${uri}`);
        const secret = await (0, secret_helpers_1.getCachedSecret)("WeivDataURIs", true);
        return secret[uri];
    }
    catch (err) {
        throw new Error(`WeivData - Error when getting connection URI from secret manager via getCachedSecret helper function, ${err}`);
    }
};
