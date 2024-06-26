import { connectionHandler } from '../Helpers/connection_helpers';
import { convertObjectId, convertStringId } from '../Helpers/item_helpers';
import NodeCache from "node-cache";
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, ItemID, WeivDataOptionsCache } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';

const cache = new NodeCache({
    checkperiod: 5,
    useClones: false,
    deleteOnExpire: true
})

export async function get(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsCache): Promise<Item | null> {
    try {
        const { safeOptions, safeItemId } = await validateParams<"get">(
            { collectionId, itemId, options },
            ["collectionId", "itemId"],
            "get"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, enableCache, cacheTimeout } = safeOptions || {};

        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await runDataHook<'beforeGet'>(collectionId, "beforeGet", [safeItemId, context]).catch((err) => {
                throw new Error(`beforeGet Hook Failure ${err}`);
            });
        }

        let newItemId = safeItemId;
        if (editedItemId) {
            newItemId = convertStringId(editedItemId);
        }

        if (enableCache) {
            const cacheKey = `${collectionId}-${safeItemId.toHexString()}-${options ? JSON.stringify(options) : "{}"}`;
            const cachedItem = cache.get(cacheKey);
            if (cachedItem && !editedItemId) {
                return cachedItem;
            }
        }


        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne(
            { _id: newItemId },
            { readConcern }
        );

        if (item) {
            if (suppressHooks != true) {
                let editedItem = await runDataHook<'afterGet'>(collectionId, 'afterGet', [item, context]).catch((err) => {
                    throw new Error(`afterGet Hook Failure ${err}`);
                });

                if (editedItem) {
                    if (editedItem._id) {
                        editedItem._id = convertObjectId(editedItem._id);
                    }

                    if (enableCache) {
                        cache.set(`${collectionId}-${safeItemId.toHexString()}-${options ? JSON.stringify(options) : "{}"}`, editedItem, cacheTimeout || 15);
                    }

                    return editedItem;
                }
            }

            if (item._id) {
                const _id = convertObjectId(item._id)

                if (enableCache) {
                    cache.set(`${collectionId}-${safeItemId.toHexString()}-${options ? JSON.stringify(options) : "{}"}`, { ...item, _id }, cacheTimeout || 15);
                }

                return {
                    ...item,
                    _id
                }
            } else {
                if (enableCache) {
                    cache.set(`${collectionId}-${safeItemId.toHexString()}-${options ? JSON.stringify(options) : "{}"}`, item, cacheTimeout || 15);
                }

                return item;
            }
        } else {
            return null;
        }
    } catch (err) {
        throw new Error(`WeivData - Error when trying to get item from the collectin by itemId: ${err}`);
    }
}

/**@internal */
export function getGetCache() {
    return cache;
}