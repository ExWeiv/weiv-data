import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';

/**
 * @description Removes a number of items from a collection.
 * @param collectionId The ID of the collection to remove the items from.
 * @param itemIds IDs of the items to remove.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The results of the bulk remove. Rejected - The error that caused the rejection.
 */
export async function bulkRemove(collectionId: string, itemIds: ObjectId[] | string[], options?: WeivDataOptions): Promise<object | null> {
    try {
        if (!collectionId || !itemIds) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemIds`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const newItemIds = itemIds.map((itemId) => {
            return convertStringId(itemId);
        })

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, deletedCount } = await collection.deleteMany({ _id: { $in: newItemIds } });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged === true) {
            return {
                removed: deletedCount,
                removedItemIds: newItemIds
            }
        } else {
            throw Error(`WeivData - Error when removing items using bulkRemove, acknowledged: ${acknowledged}, deletedCount: ${deletedCount}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}