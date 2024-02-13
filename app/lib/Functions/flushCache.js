"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flushCache = void 0;
const permission_helpers_1 = require("../Connection/permission_helpers");
const secret_helpers_1 = require("../Connection/secret_helpers");
const get_1 = require("../Functions/get");
const isReferenced_1 = require("../Functions/isReferenced");
const secret_helpers_2 = require("../Helpers/secret_helpers");
const data_query_result_1 = require("../Query/data_query_result");
const connection_provider_1 = require("../Connection/connection_provider");
const cacheSelections = {
    "permissions": permission_helpers_1.getPermissionsCache,
    "get": get_1.getGetCache,
    "isreferenced": isReferenced_1.getIsReferencedCache,
    "query": data_query_result_1.getQueryCache,
    "connectionsecrets": secret_helpers_1.getConnectionSecretsCache,
    "helpersecrets": secret_helpers_2.getHelperSecretsCache,
    "connectionclients": connection_provider_1.getConnectionClientsCache,
    "secrets": () => {
        return [(0, secret_helpers_1.getConnectionSecretsCache)(), (0, secret_helpers_2.getHelperSecretsCache)()];
    }
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
            if (typeof cacheValue === "string") {
                cachesToFlush.push(cacheValue);
            }
            else if (Array.isArray(cacheValue)) {
                cachesToFlush.concat(cacheValue);
            }
            else {
                cachesToFlush.push(cacheValue);
            }
        }
    }
    else {
        for (const key of Object.keys(cacheSelections)) { //@ts-ignore
            const cacheValue = cacheSelections[key]();
            if (typeof cacheValue === "string") {
                cachesToFlush.push(cacheValue);
            }
            else if (Array.isArray(cacheValue)) {
                cachesToFlush.concat(cacheValue);
            }
            else {
                cachesToFlush.push(cacheValue);
            }
        }
    }
    for (const cacheData of cachesToFlush) {
        if (typeof cacheData === "string") {
            if (cacheData === "connectionclients") {
                (0, connection_provider_1.cleanupClientConnections)();
            }
        }
        else {
            cacheData.flushAll();
        }
    }
}
exports.flushCache = flushCache;
