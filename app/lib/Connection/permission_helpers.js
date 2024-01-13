"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoURI = void 0;
const wix_users_backend_1 = require("wix-users-backend");
const secret_helpers_1 = require("./secret_helpers");
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default();
async function getMongoURI(suppressAuth = false) {
    try {
        if (suppressAuth != true) {
            if (wix_users_backend_1.currentUser.loggedIn) {
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
        console.error("Error on getting URI for MongoDB based on permission of current user", err);
        return getVisitorURI();
    }
}
exports.getMongoURI = getMongoURI;
const getVisitorURI = async () => {
    const cachedVisitorURI = cache.get("VisitorMongoDB_URI");
    if (cachedVisitorURI) {
        return { uri: cachedVisitorURI };
    }
    const secret = await (0, secret_helpers_1.getCachedSecret)("VisitorURI");
    cache.set("VisitorMongoDB_URI", secret, 3600 * 2);
    return { uri: secret };
};
const getAdminURI = async () => {
    const cachedAdminURI = cache.get("AdminMongoDB_URI");
    if (cachedAdminURI) {
        return {
            uri: cachedAdminURI,
            memberId: wix_users_backend_1.currentUser.id
        };
    }
    const secret = await (0, secret_helpers_1.getCachedSecret)("AdminURI");
    cache.set("AdminMongoDB_URI", secret, 3600);
    return {
        uri: secret,
        memberId: wix_users_backend_1.currentUser.id
    };
};
const getMemberURI = async () => {
    const cachedMemberURI = cache.get(`MemberMongoDB_URI${wix_users_backend_1.currentUser.id}`);
    if (cachedMemberURI) {
        return {
            uri: cachedMemberURI,
            memberId: wix_users_backend_1.currentUser.id
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
        memberId: wix_users_backend_1.currentUser.id
    };
};
