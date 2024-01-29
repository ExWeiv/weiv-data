import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';
import NodeCache from "node-cache";
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';

const cache = new NodeCache({
    stdTTL: 30,
    checkperiod: 5,
    useClones: true,
    deleteOnExpire: true
})

/**
 * @description Retrieves an item from a collection.
 * @param collectionId The ID of the collection to retrieve the item from.
 * @param itemId The ID of the item to retrieve.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The retrieved item or null if not found. Rejected - The error that caused the rejection.
 */
export async function get(collectionId: string, itemId: ObjectId | string, options?: WeivDataOptions): Promise<object | undefined> {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };

        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await runDataHook<'beforeGet'>(collectionId, "beforeGet", [itemId, context]).catch((err) => {
                throw Error(`WeivData - Hook Failure ${err}`);
            });
        }

        let newItemId;
        if (editedItemId) {
            newItemId = convertStringId(editedItemId);
        } else {
            newItemId = convertStringId(itemId);
        }

        const cacheKey = `${collectionId}-${itemId}-${options ? JSON.stringify(options) : "{}"}`;
        const cachedItem = cache.get(cacheKey);
        if (cachedItem && !editedItemId) {
            return cachedItem;
        }

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId }, { readConcern: consistentRead === true ? "majority" : "local" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (item) {
            if (suppressHooks != true) {
                let editedItem = await runDataHook<'afterGet'>(collectionId, 'afterGet', [item, context]).catch((err) => {
                    throw Error(`WeivData - Hook Failure ${err}`);
                });

                if (editedItem) {
                    return editedItem;
                }
            }

            cache.set(`${collectionId}-${itemId}-${options ? JSON.stringify(options) : "{}"}`, item);
            return item;
        } else {
            throw Error(`WeivData - Error when trying to get item from the collectin by itemId, itemId: ${newItemId}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when trying to get item from the collectin by itemId: ${err}`);
    }
}