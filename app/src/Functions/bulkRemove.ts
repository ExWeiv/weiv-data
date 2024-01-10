import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';
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
        if (!collectionId) {
            reportError("CollectionID is required when removing an item from a collection");
        }

        if (!itemIds) {
            reportError("ItemIds are required when removing items from a collection");
        }

        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        itemIds = itemIds.map((itemId) => {
            return convertStringId(itemId);
        })

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, deletedCount, } = await collection.deleteMany({ _id: { $in: itemIds } });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged === true) {
            return {
                removed: deletedCount,
                removedItemIds: itemIds
            }
        } else {
            reportError('Failed to remove items!');
        }
    } catch (err) {
        console.error(err); //@ts-ignore
        return err;
    }
}