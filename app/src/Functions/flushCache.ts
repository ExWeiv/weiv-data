import { getPermissionsCache } from '../Connection/permission_helpers';
import { getGetCache } from '../Functions/get';
import { getIsReferencedCache } from '../Functions/isReferenced';
import { getHelperSecretsCache } from '../Helpers/secret_helpers';
import { getClientCache } from '../Connection/automatic_connection_provider';
import NodeCache from 'node-cache';
import type { CacheSelections } from '@exweiv/weiv-data';

type CacheSelectionsObject = {
    [Key in CacheSelections as string]: () => NodeCache; // Define the value type as a function returning any
};

const cacheSelections: CacheSelectionsObject = {
    "permissions": getPermissionsCache,
    "get": getGetCache,
    "isreferenced": getIsReferencedCache,
    "helpersecrets": getHelperSecretsCache,
    "connectionclients": getClientCache,
    "secrets": getHelperSecretsCache
}

export function flushCache(filters?: CacheSelections[]): void {
    try {
        const cachesToFlush = [];

        if (filters) {
            if (filters.length > 0) {
                for (const filter of filters) {
                    const cacheValue = cacheSelections[filter]();
                    cachesToFlush.push(cacheValue);
                }
            } else {
                for (const key of Object.keys(cacheSelections)) {
                    const cacheValue: NodeCache = cacheSelections[key]();
                    cachesToFlush.push(cacheValue);
                }
            }
        }

        for (const key of Object.keys(cacheSelections)) {
            const cacheValue: NodeCache = cacheSelections[key]();
            cachesToFlush.push(cacheValue);
        }


        for (const cacheData of cachesToFlush) {
            cacheData.flushAll();
        }
    } catch (err) {
        throw new Error(`WeivData - Error when flushing caches! ${err}`);
    }
}