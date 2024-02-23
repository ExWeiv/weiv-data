import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptions } from '../Helpers/collection';
import { ObjectId } from 'mongodb';

/**
 * Replaces and item in a collection. The item you passed with `item` param will take the place of existing data/document in your collection.
 * 
 * This function has it's own hooks _beforeUpdate_ and _afterUpdate_ is not used here instead _beforeReplace_ and _afterReplace_ is used.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // An item with an id
 * const updatedVersion = {...}
 * // Options for the operation
 * const options = {suppressHooks: true};
 * 
 * const result = await weivData.replace("Clusters/IST57", updatedVersion, options)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection that contains the item to replace.
 * @param item The item to replace.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item>} Fulfilled - The object that was replaced. Rejected - The error that caused the rejection.
 */
export async function replace(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<Item> {
    try {
        if (!collectionId || !item._id) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item._id`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = options || { suppressAuth: false, suppressHooks: false };

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeReplace'>(collectionId, "beforeReplace", [item, context]).catch((err) => {
                throw Error(`WeivData - beforeReplace Hook Failure ${err}`);
            });
        }

        const itemId = !editedItem ? convertStringId(item._id) : convertStringId(editedItem._id);
        const replaceItem = !editedItem ? item : editedItem;
        const filter = !itemId ? { _id: new ObjectId() } : { _id: itemId };
        delete replaceItem._id;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const value = await collection.findOneAndReplace(
            filter,
            { $set: { ...replaceItem, _updatedDate: new Date() } },
            { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (value) {
            if (suppressHooks != true) {
                let editedResult = await runDataHook<'afterReplace'>(collectionId, "afterReplace", [value, context]).catch((err) => {
                    throw Error(`WeivData - afterReplace Hook Failure ${err}`);
                });

                if (editedResult) {
                    return editedResult;
                }
            }

            return value;
        } else {
            throw Error(`WeivData - Error when replacing an item, returned value: ${value}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when replacing an item: ${err}`);
    }
}