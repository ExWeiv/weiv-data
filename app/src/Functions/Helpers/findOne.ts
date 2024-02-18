import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, WeivDataOptions } from '../../Helpers/collection';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';

/**
 * You can use findOne to find a single item from your collections based on .eq filter
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * const filteredItem = await weivData.findOne("Db/Collection", "name", "John");
 * console.log(filteredItem);
 * ```
 * 
 * @param collectionId The ID of the collection to remove the item from.
 * @param propertyName Property to filter.
 * @param value Filter value (mathing value for .eq filter)
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item | undefined>} Fulfilled - Updated item 
 */
export async function findOne(collectionId: CollectionID, propertyName: string, value: any, options?: WeivDataOptions): Promise<Item | undefined> {
    try {
        if (!collectionId || !propertyName || !value) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, value`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};

        let editedFilter = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedFilter = await runDataHook<'beforeFindOne'>(collectionId, "beforeFindOne", [{ propertyName, value }, context]).catch((err) => {
                throw Error(`WeivData - beforeFindOne Hook Failure ${err}`);
            });

            if (modifiedFilter) {
                editedFilter = modifiedFilter;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne(
            { [editedFilter.propertyName]: editedFilter.value },
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterFindOne'>(collectionId, "afterFindOne", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterFindOne Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when finding an item from collection (findOne): ${err}`);
    }
}