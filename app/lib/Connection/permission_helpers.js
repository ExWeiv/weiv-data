"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoURI = getMongoURI;
exports.getPermissionsCache = getPermissionsCache;
const wix_users_backend_1 = require("wix-users-backend");
const secret_helpers_1 = require("../Helpers/secret_helpers");
const cacheable_1 = require("cacheable");
const crypto_js_1 = __importDefault(require("crypto-js"));
const encrypt_helpers_1 = require("../Helpers/encrypt_helpers");
const error_manager_1 = require("../Errors/error_manager");
const cache = new cacheable_1.CacheableMemory({ useClone: false, checkInterval: 5000 });
async function getMongoURI(suppressAuth = false) {
    try {
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
        (0, error_manager_1.kaptanLogar)("00009", `on getting URI for MongoDB based on permission of current user: ${err}`);
    }
}
const getVisitorURI = async () => {
    try {
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
            (0, error_manager_1.kaptanLogar)("00009", `WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when getting VisitorURI: ${err}`);
    }
};
const getAdminURI = async () => {
    try {
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
            (0, error_manager_1.kaptanLogar)("00009", `WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when getting AdminURI: ${err}`);
    }
};
const getMemberURI = async () => {
    try {
        const cachedEncryptedMemberURI = cache.get(`MemberURI${wix_users_backend_1.currentUser.id}`);
        if (cachedEncryptedMemberURI) {
            const cachedMemberURI = await decryptURI(cachedEncryptedMemberURI);
            return {
                uri: cachedMemberURI,
                memberId: wix_users_backend_1.currentUser.id,
                role: "memberClientOptions"
            };
        }
        const cachedRole = cache.get(`MemberRoles${wix_users_backend_1.currentUser.id}`);
        if (cachedRole) {
            if (cachedRole === "Admin") {
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
                return getAdminURI();
            }
        }
        else {
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
            (0, error_manager_1.kaptanLogar)("00009", `WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when getting MemberURI: ${err}`);
    }
};
function getPermissionsCache() {
    return cache;
}
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
        const secret = await (0, secret_helpers_1.getCachedSecret)("WeivDataURIs", true);
        return secret[uri];
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00009", `when getting connection URI from secret manager via getCachedSecret helper function, ${err}`);
    }
};
