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
/**
 * Use when you want to flush the caches internally. You can choose caches to flush or pass empty array to flush all of them.
 *
 * @param filters Filter which cache to flush. Pass empty array to flush all of them.
 * @public
 */
function flushCache(filters) {
    const cachesToFlush = [];
    if (filters.length > 0) {
        for (const filter of filters) {
            const cacheValue = cacheSelections[filter]();
            cachesToFlush.push(cacheValue);
        }
    }
    else {
        for (const key of Object.keys(cacheSelections)) { //@ts-ignore
            const cacheValue = cacheSelections[key]();
            cachesToFlush.push(cacheValue);
        }
    }
    for (const cacheData of cachesToFlush) {
        cacheData.flushAll();
    }
}
exports.flushCache = flushCache;
