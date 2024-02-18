import { getPermissionsCache } from '../Connection/permission_helpers';
import { getGetCache } from '../Functions/get';
import { getIsReferencedCache } from '../Functions/isReferenced';
import { getHelperSecretsCache } from '../Helpers/secret_helpers';
import { getQueryCache } from '../Query/data_query_result';
import { getClientCache } from '../Connection/automatic_connection_provider';
import NodeCache from 'node-cache';

/**@public */
export type CacheSelections = "permissions" | "secrets" | "get" | "isreferenced" | "query" | "helpersecrets" | "connectionclients";

type CacheSelectionsObject = {
    [Key in CacheSelections]: () => NodeCache; // Define the value type as a function returning any
};

const cacheSelections: CacheSelectionsObject = {
    "permissions": getPermissionsCache,
    "get": getGetCache,
    "isreferenced": getIsReferencedCache,
    "query": getQueryCache,
    "helpersecrets": getHelperSecretsCache,
    "connectionclients": getClientCache,
    "secrets": getHelperSecretsCache
}

/**
 * Use when you want to flush the caches internally. You can choose caches to flush or pass empty array to flush all of them.
 * 
 * @param filters Filter which cache to flush. Pass empty array to flush all of them.
 * @public
 */
export function flushCache(filters?: CacheSelections[]): void {
    const cachesToFlush = [];

    if (filters) {
        if (filters.length > 0) {
            for (const filter of filters) {
                const cacheValue = cacheSelections[filter]();
                cachesToFlush.push(cacheValue);
            }
        } else {
            for (const key of Object.keys(cacheSelections)) { //@ts-ignore
                const cacheValue: NodeCache = cacheSelections[key]();
                cachesToFlush.push(cacheValue);
            }
        }
    }

    for (const key of Object.keys(cacheSelections)) { //@ts-ignore
        const cacheValue: NodeCache = cacheSelections[key]();
        cachesToFlush.push(cacheValue);
    }


    for (const cacheData of cachesToFlush) {
        cacheData.flushAll();
    }
}