import { CollectionID, ItemIDs, WeivDataOptions } from '../../weivdata';
import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';

/**
 * Removes a number of items from a collection.
 * 
 * @param collectionId The ID of the collection to remove the items from.
 * @param itemIds IDs of the items to remove.
 * @param options An object containing options to use when processing this operation.
 * @returns {WeivDataOptions} Fulfilled - The results of the bulk remove. Rejected - The error that caused the rejection.
 */
export async function bulkRemove(collectionId: CollectionID, itemIds: ItemIDs, options?: WeivDataOptions): Promise<object | null> {
    try {
        if (!collectionId || !itemIds) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemIds`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};

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

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, deletedCount } = await collection.deleteMany({ _id: { $in: editedItemIds } }, { readConcern: consistentRead === true ? "majority" : "local" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged === true) {
            // if (suppressHooks != true) {
            //     // 
            // }

            return {
                removed: deletedCount,
                removedItemIds: editedItemIds
            }
        } else {
            throw Error(`WeivData - Error when removing items using bulkRemove, acknowledged: ${acknowledged}, deletedCount: ${deletedCount}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}