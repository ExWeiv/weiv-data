"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareHookContext = prepareHookContext;
const wix_users_backend_1 = require("wix-users-backend");
const name_helpers_1 = require("./name_helpers");
function prepareHookContext(collectionId) {
    const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
    const roles = wix_users_backend_1.currentUser.getRoles();
    if (wix_users_backend_1.currentUser.loggedIn) {
        return {
            dbName,
            collectionName,
            userId: wix_users_backend_1.currentUser.id,
            userRoles: roles
        };
    }
    else {
        return {
            dbName,
            collectionName,
            userRoles: roles
        };
    }
}
