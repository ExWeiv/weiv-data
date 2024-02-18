import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '../../Helpers/collection';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { convertStringId } from '../../Helpers/item_helpers';

/**
 * You can use getAndReplace to find an item by it's _id and replace it with new data. (ID will stay same)
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * const itemId = "...";
 * const replacedItem = await weivData.getAndReplace("Db/Collection", itemId, {...});
 * console.log(replacedItem);
 * ```
 * 
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId ItemID to filter the _id field when performing the operation.
 * @param value Object contains new data.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | undefined>} Fulfilled - Updated item 
 */
export async function getAndReplace(collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptions): Promise<Item | undefined> {
    try {
        if (!collectionId || !itemId || !value) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId, value`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};

        let editedItem = value;
        if (suppressHooks != true) {
            const modifiedItem = await runDataHook<'beforeGetAndReplace'>(collectionId, "beforeGetAndReplace", [value, context]).catch((err) => {
                throw Error(`WeivData - beforeGetAndReplace Hook Failure ${err}`);
            });

            if (modifiedItem) {
                editedItem = modifiedItem;
            }
        }

        delete editedItem._id;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndReplace(
            { _id: convertStringId(itemId) },
            editedItem,
            { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterGetAndReplace'>(collectionId, "afterGetAndReplace", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGetAndReplace Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when replacing an item from collection (getAndReplace): ${err}`);
    }
}