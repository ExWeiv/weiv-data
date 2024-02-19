import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptions } from '../Helpers/collection';

/**
 * Updates an item in a collection.
 * !! IMPORTANT: In weiv-data you don't need to pass the al data. It's enough to just pass the updated values in your document.
 * Anything that's not in the update object will be untouched and will stay how it was before.
 * In wix-data if you don't pass a field in your document it will be overwritten as undefined. This doesn't apply to weiv-data.
 * If you want this logic use `replace` function instead. 
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
 * const result = await weivData.update("Clusters/IST12", updatedVersion, options)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection that contains the item to update.
 * @param item The item to update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item>} Fulfilled - The object that was updated. Rejected - The error that caused the rejection.
 */
export async function update(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<Item> {
    try {
        if (!collectionId || !item._id) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item._id`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || { suppressAuth: false, suppressHooks: false };

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                throw Error(`WeivData - beforeUpdate Hook Failure ${err}`);
            });
        }

        const itemId = !editedItem ? convertStringId(item._id) : convertStringId(editedItem._id);
        const updateItem = !editedItem ? item : editedItem;
        delete updateItem._id;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const value = await collection.findOneAndUpdate(
            { _id: itemId },
            { $set: { ...updateItem, _updatedDate: new Date() } },
            { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (value) {
            if (suppressHooks != true) {
                let editedResult = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [value, context]).catch((err) => {
                    throw Error(`WeivData - afterUpdate Hook Failure ${err}`);
                });

                if (editedResult) {
                    return editedResult;
                }
            }

            return value;
        } else {
            throw Error(`WeivData - Error when updating an item, returned value: ${value}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when updating an item: ${err}`);
    }
}