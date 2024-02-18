import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '../Helpers/collection';

/**
 * Removes an item from a collection.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // ID of item that will be removed
 * const itemId = "..."
 * 
 * const result = await weivData.remove("Clusters/Riva", itemId)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId The ID of the item to remove.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | null>} Fulfilled - The removed item, or null if the item was not found. Rejected - The error that caused the rejection.
 */
export async function remove(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptions): Promise<Item | null> {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};

        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await runDataHook<'beforeRemove'>(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                throw Error(`WeivData - beforeRemove Hook Failure ${err}`);
            });
        }

        let newItemId;
        if (editedItemId) {
            newItemId = convertStringId(editedItemId);
        } else {
            newItemId = convertStringId(itemId);
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { ok, value } = await collection.findOneAndDelete(
            { _id: newItemId },
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (ok === 1 && value) {
            if (suppressHooks != true) {
                let editedItem = await runDataHook<'afterRemove'>(collectionId, 'afterRemove', [value, context]).catch((err) => {
                    throw Error(`WeivData - afterRemove Hook Failure ${err}`);
                });

                if (editedItem) {
                    return editedItem;
                }
            }

            return value;
        } else {
            console.error(`WeivData - Error when removing an item from collection, ok: ${ok}`);
            return null;
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing an item from collection: ${err}`);
    }
}