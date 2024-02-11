import { getPermissionsCache } from '../Connection/permission_helpers';
import { getConnectionSecretsCache } from '../Connection/secret_helpers';
import { getGetCache } from '../Functions/get';
import { getIsReferencedCache } from '../Functions/isReferenced';
import { getHelperSecretsCache } from '../Helpers/secret_helpers';
import { getQueryCache } from '../Query/data_query_result';
import { getConnectionClientsCache, cleanupClientConnections } from '../Connection/connection_provider';
import NodeCache from 'node-cache';

export type CacheSelections = "permissions" | "secrets" | "get" | "isreferenced" | "query" | "connectionsecrets" | "helpersecrets" | "connectionclients";
type CacheSelectionsObject = {
    [Key in CacheSelections]: () => NodeCache | string | NodeCache[]; // Define the value type as a function returning any
};

const cacheSelections: CacheSelectionsObject = {
    "permissions": getPermissionsCache,
    "get": getGetCache,
    "isreferenced": getIsReferencedCache,
    "query": getQueryCache,
    "connectionsecrets": getConnectionSecretsCache,
    "helpersecrets": getHelperSecretsCache,
    "connectionclients": getConnectionClientsCache,
    "secrets": () => {
        return [getConnectionSecretsCache(), getHelperSecretsCache()]
    }
}

/**
 * Use when you want to flush the caches internally. You can choose caches to flush or pass empty array to flush all of them.
 * 
 * @param filters Filter which cache to flush. Pass empty array to flush all of them.
 * @public
 */
export function flushCache(filters: CacheSelections[]): void {
    const cachesToFlush = [];

    if (filters.length > 0) {
        for (const filter of filters) {
            const cacheValue = cacheSelections[filter]();
            if (typeof cacheValue === "string") {
                cachesToFlush.push(cacheValue)
            } else if (Array.isArray(cacheValue)) {
                cachesToFlush.concat(cacheValue)
            } else {
                cachesToFlush.push(cacheValue)
            }
        }
    } else {
        for (const key of Object.keys(cacheSelections)) { //@ts-ignore
            const cacheValue: NodeCache | string | NodeCache[] = cacheSelections[key]();
            if (typeof cacheValue === "string") {
                cachesToFlush.push(cacheValue)
            } else if (Array.isArray(cacheValue)) {
                cachesToFlush.concat(cacheValue)
            } else {
                cachesToFlush.push(cacheValue)
            }
        }
    }

    for (const cacheData of cachesToFlush) {
        if (typeof cacheData === "string") {
            if (cacheData === "connectionclients") {
                cleanupClientConnections();
            }
        } else {
            cacheData.flushAll();
        }
    }
}