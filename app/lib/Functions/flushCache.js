"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flushCache = flushCache;
const permission_helpers_1 = require("../Connection/permission_helpers");
const isReferenced_1 = require("../Functions/isReferenced");
const secret_helpers_1 = require("../Helpers/secret_helpers");
const automatic_connection_provider_1 = require("../Connection/automatic_connection_provider");
const error_manager_1 = require("../Errors/error_manager");
const cacheSelections = {
    "permissions": permission_helpers_1.getPermissionsCache,
    "isreferenced": isReferenced_1.getIsReferencedCache,
    "helpersecrets": secret_helpers_1.getHelperSecretsCache,
    "connectionclients": automatic_connection_provider_1.getClientCache,
    "secrets": secret_helpers_1.getHelperSecretsCache
};
function flushCache(filters) {
    try {
        const cachesToFlush = [];
        if (filters) {
            if (filters.length > 0) {
                for (const filter of filters) {
                    const cacheValue = cacheSelections[filter]();
                    cachesToFlush.push(cacheValue);
                }
            }
            else {
                for (const key of Object.keys(cacheSelections)) {
                    const cacheValue = cacheSelections[key]();
                    cachesToFlush.push(cacheValue);
                }
            }
        }
        for (const key of Object.keys(cacheSelections)) {
            const cacheValue = cacheSelections[key]();
            cachesToFlush.push(cacheValue);
        }
        for (const cacheData of cachesToFlush) {
            cacheData.flushAll();
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00019", `${err}`);
    }
}
