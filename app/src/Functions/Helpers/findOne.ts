import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, WeivDataOptionsCache } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import NodeCache from 'node-cache';
import { validateParams } from '../../Helpers/validator';

const cache = new NodeCache({
    checkperiod: 5,
    useClones: false,
    deleteOnExpire: true
})

export async function findOne(collectionId: CollectionID, propertyName: string, value: any, options?: WeivDataOptionsCache): Promise<Item | undefined> {
    try {
        const { safeValue, safeOptions } = await validateParams<"findOne">(
            { collectionId, propertyName, value, options },
            ["collectionId", "propertyName", "value"],
            "findOne"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, enableCache, cacheTimeout } = safeOptions || {};

        let editedFilter = { propertyName, value: safeValue };
        if (suppressHooks != true) {
            const modifiedFilter = await runDataHook<'beforeFindOne'>(collectionId, "beforeFindOne", [{ propertyName, value: safeValue }, context]).catch((err) => {
                throw Error(`WeivData - beforeFindOne Hook Failure ${err}`);
            });

            if (modifiedFilter) {
                editedFilter = modifiedFilter;
            }
        }

        if (enableCache) {
            const cacheKey = `${collectionId}-${editedFilter.propertyName}-${editedFilter.value ? JSON.stringify(editedFilter.value) : "{}"}`;
            const cachedItem = cache.get(cacheKey);
            if (cachedItem) {
                return cachedItem;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne(
            { [editedFilter.propertyName]: editedFilter.value },
            { readConcern: readConcern ? readConcern : "local" }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterFindOne'>(collectionId, "afterFindOne", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterFindOne Hook Failure ${err}`);
                });

                if (modifiedResult) {
                    return modifiedResult;
                }
            }

            if (enableCache) {
                cache.set(`${collectionId}-${editedFilter.propertyName}-${editedFilter.value ? JSON.stringify(editedFilter.value) : "{}"}`, item, cacheTimeout || 15);
            }

            return item;
        } else {
            return undefined;
        }
    } catch (err) {
        throw Error(`WeivData - Error when finding an item from collection (findOne): ${err}`);
    }
}