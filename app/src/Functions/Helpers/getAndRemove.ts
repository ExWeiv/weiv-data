import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '../../Helpers/collection';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { convertStringId } from '../../Helpers/item_helpers';

/**
 * You can use getAndRemove to find an item by it's _id and remove it.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * const itemId = "...";
 * const removedItem = await weivData.getAndRemove("Db/Collection", itemId);
 * console.log(removedItem);
 * ```
 * 
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId ItemID to filter the _id field when performing the operation.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | undefined>} Fulfilled - Updated item 
 */
export async function getAndRemove(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptions): Promise<Item | undefined> {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = options || {};

        let editedItemId = itemId;
        if (suppressHooks != true) {
            const modifiedItemId = await runDataHook<'beforeGetAndRemove'>(collectionId, "beforeGetAndRemove", [itemId, context]).catch((err) => {
                throw Error(`WeivData - beforeGetAndRemove Hook Failure ${err}`);
            });

            if (modifiedItemId) {
                editedItemId = modifiedItemId;
            }
        }

        editedItemId = convertStringId(editedItemId);

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndDelete(
            { _id: editedItemId },
            { readConcern: readConcern ? readConcern : "local", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterGetAndRemove'>(collectionId, "afterGetAndRemove", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGetAndRemove Hook Failure ${err}`);
                });

                if (modifiedResult) {
                    return modifiedResult;
                }
            }

            return item;
        } else {
            return undefined;
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing an item from collection (getAndRemove): ${err}`);
    }
}