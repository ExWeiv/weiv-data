import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '../../Helpers/collection';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { convertStringId } from '../../Helpers/item_helpers';

/**
 * You can use getAndUpdate to find an item by it's _id and update it's content. (ID will stay same)
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * const itemId = "...";
 * const updatedItem = await weivData.getAndUpdate("Db/Collection", itemId, {...});
 * console.log(updatedItem);
 * ```
 * 
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId ItemID to filter the _id field when performing the operation.
 * @param value Object contains updated data.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | undefined>} Fulfilled - Updated item 
 */
export async function getAndUpdate(collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptions): Promise<Item | undefined> {
    try {
        if (!collectionId || !itemId || !value) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId, value`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};

        let editedItem = value;
        if (suppressHooks != true) {
            const modifiedItem = await runDataHook<'beforeGetAndUpdate'>(collectionId, "beforeGetAndUpdate", [value, context]).catch((err) => {
                throw Error(`WeivData - beforeGetAndUpdate Hook Failure ${err}`);
            });

            if (modifiedItem) {
                editedItem = modifiedItem;
            }
        }

        delete editedItem._id;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: convertStringId(itemId) },
            { $set: editedItem },
            { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterGetAndUpdate'>(collectionId, "afterGetAndUpdate", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGetAndUpdate Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when updating an item from collection (getAndUpdate): ${err}`);
    }
}