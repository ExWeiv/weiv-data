import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, ItemIDs, WeivDataOptions } from '../Helpers/collection';

/**
 * Object returned for bulkRemove function.
 * @public
 */
export interface WeivDataBulkRemoveResult {
    /**
     * Number of removed items.
     */
    removed: number;

    /**
     * Removed item ids.
     */
    removedItemIds: ItemIDs
}

/**
 * Removes a number of items from a collection.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // Item IDs that will be bulk removed
 * const itemsToRemove = ["...", "...", "..."]
 * 
 * const result = await weivData.bulkRemove("Clusters/Odunpazari", itemsToRemove)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to remove the items from.
 * @param itemIds IDs of the items to remove.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<WeivDataBulkRemoveResult>} Fulfilled - The results of the bulk remove. Rejected - The error that caused the rejection.
 */
export async function bulkRemove(collectionId: CollectionID, itemIds: ItemIDs, options?: WeivDataOptions): Promise<WeivDataBulkRemoveResult> {
    try {
        if (!collectionId || !itemIds) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemIds`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, consistentRead } = options || {};

        let editedItemIds: ObjectId[] | Promise<ObjectId>[] = itemIds.map(async (itemId) => {
            if (suppressHooks != true) {
                const editedId = await runDataHook<'beforeRemove'>(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                    throw Error(`WeivData - beforeRemove (bulkRemove) Hook Failure ${err}`);
                });

                if (editedId) {
                    return convertStringId(editedId);
                } else {
                    return convertStringId(itemId);
                }
            } else {
                return convertStringId(itemId);
            }
        })

        editedItemIds = await Promise.all(editedItemIds);
        const writeOperations = await editedItemIds.map((itemId) => {
            return {
                deleteOne: {
                    filter: { _id: itemId },
                }
            }
        });

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { deletedCount, hasWriteErrors, getWriteErrors } = await collection.bulkWrite(
            writeOperations,
            { readConcern: consistentRead === true ? "majority" : "local", ordered: true }
        );

        if (!hasWriteErrors()) {
            return {
                removed: deletedCount,
                removedItemIds: editedItemIds
            }
        } else {
            throw Error(`WeivData - Error when removing items using bulkRemove: removed: ${deletedCount}, write errors: ${getWriteErrors()}`)
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}