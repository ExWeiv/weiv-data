import { connectionHandler } from '../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '../Helpers/collection';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { convertStringId } from '../Helpers/item_helpers';
import { isArray } from 'lodash';

/**
 * You can use push function to push new values into an array field in an item.
 * This function uses $push operator.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * const itemId = "...";
 * const result = await weivData.push("Db/Collection", itemId, "arrField", [...], -1);
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId ItemID to filter the _id field when performing the operation.
 * @param propertyName Property name for the array field.
 * @param value Values to push into array.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | null>} Fulfilled - Updated item 
 */
export async function push(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: any, options?: WeivDataOptions): Promise<Item | null> {
    try {
        if (!collectionId || !itemId || !value || !propertyName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId, value, propertyName`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};

        let editedModify = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedParams = await runDataHook<'beforePush'>(collectionId, "beforePush", [{ propertyName, value }, context]).catch((err) => {
                throw Error(`WeivData - beforePush Hook Failure ${err}`);
            });

            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: convertStringId(itemId) },
            { $push: { [editedModify.propertyName]: isArray(editedModify.value) ? { $each: editedModify.value } : editedModify.value } },
            { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterPush'>(collectionId, "afterPush", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterPush Hook Failure ${err}`);
                });

                if (modifiedResult) {
                    return modifiedResult;
                }
            }

            return item;
        } else {
            return null;
        }
    } catch (err) {
        throw Error(`WeivData - Error when inserting (pushing) new value/s into an array filed in an item: ${err}`);
    }
}