import { connectionHandler } from '../Helpers/connection_helpers';
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
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false};
        const newItemId = convertStringId(itemId);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId });
        const { acknowledged, deletedCount } = await collection.deleteOne({ _id: newItemId });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged) {
            if (deletedCount === 1) {
                return item;
            } else {
                return null;
            }
        } else {
            throw Error(`WeivData - Error when removing an item from collection, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing an item from collection: ${err}`);
    }
}