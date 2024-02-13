"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareHookContext = void 0;
//@ts-ignore
const wix_users_backend_1 = require("wix-users-backend");
const name_helpers_1 = require("./name_helpers");
function prepareHookContext(collectionId) {
    const roles = wix_users_backend_1.currentUser.getRoles();
    const { dbName, collectionName } = (0, name_helpers_1.splitCollectionId)(collectionId);
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
exports.prepareHookContext = prepareHookContext;
