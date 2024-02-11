"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissionsCache = exports.getMongoURI = void 0;
const wix_users_backend_1 = require("wix-users-backend");
const secret_helpers_1 = require("./secret_helpers");
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default();
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
        throw Error(`Error on getting URI for MongoDB based on permission of current user: ${err}`);
    }
}
exports.getMongoURI = getMongoURI;
const getVisitorURI = async () => {
    try {
        const cachedVisitorURI = cache.get("VisitorMongoDB_URI");
        if (cachedVisitorURI) {
            return { uri: cachedVisitorURI, role: "visitorClientOptions" };
        }
        const secret = await (0, secret_helpers_1.getCachedSecret)("VisitorURI");
        cache.set("VisitorMongoDB_URI", secret.toString(), 3600 * 2);
        return { uri: secret, role: "visitorClientOptions" };
    }
    catch (err) {
        throw Error(`Error when getting VisitorURI: ${err}`);
    }
};
const getAdminURI = async () => {
    try {
        const cachedAdminURI = cache.get("AdminMongoDB_URI");
        if (cachedAdminURI) {
            return {
                uri: cachedAdminURI,
                memberId: wix_users_backend_1.currentUser.id,
                role: "adminClientOptions"
            };
        }
        const secret = await (0, secret_helpers_1.getCachedSecret)("AdminURI");
        cache.set("AdminMongoDB_URI", secret.toString(), 3600);
        return {
            uri: secret,
            memberId: wix_users_backend_1.currentUser.id,
            role: "adminClientOptions"
        };
    }
    catch (err) {
        throw Error(`Error when getting AdminURI: ${err}`);
    }
};
const getMemberURI = async () => {
    try {
        const cachedMemberURI = cache.get(`MemberMongoDB_URI${wix_users_backend_1.currentUser.id}`);
        if (cachedMemberURI) {
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
            cache.set(`MemberRoles${wix_users_backend_1.currentUser.id}`, roles[0].name, 3600 * 2);
            if (roles[0].name === "Admin") {
                return getAdminURI();
            }
        }
        else {
            cache.set(`MemberRoles${wix_users_backend_1.currentUser.id}`, "Member", 3600 * 2);
        }
        const secret = await (0, secret_helpers_1.getCachedSecret)("MemberURI");
        cache.set(`MemberMongoDB_URI${wix_users_backend_1.currentUser.id}`, secret, 3600);
        return {
            uri: secret,
            memberId: wix_users_backend_1.currentUser.id,
            role: "memberClientOptions"
        };
    }
    catch (err) {
        throw Error(`Error when getting MemberURI: ${err}`);
    }
};
function getPermissionsCache() {
    return cache;
}
exports.getPermissionsCache = getPermissionsCache;
