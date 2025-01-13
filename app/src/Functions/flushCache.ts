import { getPermissionsCache } from '../Connection/permission_helpers';
import { getIsReferencedCache } from '../Functions/isReferenced';
import { getHelperSecretsCache } from '../Helpers/secret_helpers';
import { getClientCache } from '../Connection/automatic_connection_provider';
import { CacheableMemory } from 'cacheable';
import type { CacheSelections } from '@exweiv/weiv-data';
import { kaptanLogar } from '../Errors/error_manager';

type CacheSelectionsObject = {
    [Key in CacheSelections as string]: () => CacheableMemory; // Define the value type as a function returning any
};

const cacheSelections: CacheSelectionsObject = {
    "permissions": getPermissionsCache,
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
                    const cacheValue: CacheableMemory = cacheSelections[key]();
                    cachesToFlush.push(cacheValue);
                }
            }
        }

        for (const key of Object.keys(cacheSelections)) {
            const cacheValue: CacheableMemory = cacheSelections[key]();
            cachesToFlush.push(cacheValue);
        }


        for (const cacheData of cachesToFlush) {
            cacheData.clear();
        }
    } catch (err) {
        kaptanLogar("00019", `${err}`);
    }
}