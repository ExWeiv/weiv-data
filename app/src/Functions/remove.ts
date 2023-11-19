import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';

/**
 * @description Removes an item from a collection.
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId The ID of the item to remove.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The removed item, or null if the item was not found. Rejected - The error that caused the rejection.
 */
export async function remove(collectionId: string, itemId: ObjectId | string, options?: WeivDataOptions): Promise<object | null> {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when removing an item from a collection");
        }

        if (!itemId) {
            reportError("ItemId is required when removing an item from a collection");
        }

        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        itemId = convertStringId(itemId);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: itemId });
        const { acknowledged, deletedCount } = await collection.deleteOne({ _id: itemId });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged === true) {
            if (deletedCount === 1) {
                return item;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (err) {
        console.error(err); //@ts-ignore
        return err;
    }
}