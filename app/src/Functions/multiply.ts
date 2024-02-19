import { connectionHandler } from '../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '../Helpers/collection';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { convertStringId } from '../Helpers/item_helpers';

/**
 * You can use multiply function to multiply the value of a filed in an item.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * const itemId = "...";
 * const result = await weivData.multiply("Db/Collection", itemId, "numberField", 3 {...});
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId ItemID to filter the _id field when performing the operation.
 * @param propertyName Property name for the multiply field.
 * @param value Multiply current value by that much. (If you set it to 10 it will multiply it by 10 `x*10`)
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | null>} Fulfilled - Updated item 
 */
export async function multiply(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: number, options?: WeivDataOptions): Promise<Item | null> {
    try {
        if (!collectionId || !itemId || !value || !propertyName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId, value, propertyName`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};

        let editedModify = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedParams = await runDataHook<'beforeMultiply'>(collectionId, "beforeMultiply", [{ propertyName, value }, context]).catch((err) => {
                throw Error(`WeivData - beforeMultiply Hook Failure ${err}`);
            });

            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: convertStringId(itemId) },
            { $mul: { [editedModify.propertyName]: editedModify.value } },
            { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterMultiply'>(collectionId, "afterMultiply", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterMultiply Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when multiplying a filed in an item: ${err}`);
    }
}