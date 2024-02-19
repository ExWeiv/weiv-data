"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flushCache = void 0;
const permission_helpers_1 = require("../Connection/permission_helpers");
const get_1 = require("../Functions/get");
const isReferenced_1 = require("../Functions/isReferenced");
const secret_helpers_1 = require("../Helpers/secret_helpers");
const data_query_result_1 = require("../Query/data_query_result");
const automatic_connection_provider_1 = require("../Connection/automatic_connection_provider");
const cacheSelections = {
    "permissions": permission_helpers_1.getPermissionsCache,
    "get": get_1.getGetCache,
    "isreferenced": isReferenced_1.getIsReferencedCache,
    "query": data_query_result_1.getQueryCache,
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
        throw Error(`WeivData - Error when flushing caches! ${err}`);
    }
}
exports.flushCache = flushCache;
