import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, Items, WeivDataOptions } from '../Helpers/collection';

/**
 * Object returned for bulkUpdate function.
 * @public
 */
export interface WeivDataBulkUpdateResult {
    /**
     * Number of updated items.
     */
    updated: number;

    /**
     * Updated items.
     */
    updatedItems: Items;
}

/**
 * Updates a number of items in a collection.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // Items that will be bulk updated
 * const itemsToUpdate = [{...}, {...}, {...}]
 * 
 * const result = await weivData.bulkUpdate("Clusters/Odunpazari", itemsToUpdate)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection that contains the item to update.
 * @param items The items to update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<WeivDataBulkUpdateResult>} Fulfilled - The results of the bulk save. Rejected - The error that caused the rejection.
 */
export async function bulkUpdate(collectionId: CollectionID, items: Items, options?: WeivDataOptions): Promise<WeivDataBulkUpdateResult> {
    try {
        if (!collectionId || !items) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }

        for (const item of items) {
            if (!item._id) {
                throw Error(`WeivData - Item (_id) ID is required for each item when bulk updating ID is missing for one or more item in your array!`);
            }
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};

        let editedItems: Items | Promise<Items>[] = items.map(async (item) => {
            item._id = convertStringId(item._id);

            if (suppressHooks != true) {
                const editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeUpdate (bulkUpdate) Hook Failure ${err}`);
                });

                if (editedItem) {
                    return {
                        ...editedItem,
                        _updatedDate: new Date()
                    }
                } else {
                    return {
                        ...item,
                        _updatedDate: new Date()
                    }
                }
            } else {
                return {
                    ...item,
                    _updatedDate: new Date()
                }
            }
        })

        editedItems = await Promise.all(editedItems);

        const bulkOperations = editedItems.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: item }
                }
            }
        })

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { matchedCount } = await collection.bulkWrite(bulkOperations, { readConcern: consistentRead === true ? "majority" : "local" })

        if (suppressHooks != true) {
            editedItems = editedItems.map(async (item) => {
                const editedItem = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterUpdate (bulkUpdate) Hook Failure ${err}`);
                });

                if (editedItem) {
                    return editedItem;
                } else {
                    return item;
                }
            })

            editedItems = await Promise.all(editedItems);
        }

        return {
            updated: matchedCount,
            updatedItems: editedItems
        }
    } catch (err) {
        throw Error(`WeivData - Error when updating items using bulkUpdate: ${err}`);
    }
}