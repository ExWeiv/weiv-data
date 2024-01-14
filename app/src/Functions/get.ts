import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';

/**
 * @description Retrieves an item from a collection.
 * @param collectionId The ID of the collection to retrieve the item from.
 * @param itemId The ID of the item to retrieve.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The retrieved item or null if not found. Rejected - The error that caused the rejection.
 */
export async function get(collectionId: string, itemId: ObjectId | string, options?: WeivDataOptions): Promise<object | null> {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const newItemId = convertStringId(itemId);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId }, { readConcern: consistentRead === true ? "majority" : "local" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (item) {
            return item;
        } else {
            throw Error(`WeivData - Error when trying to get item from the collectin by itemId, itemId: ${newItemId}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when trying to get item from the collectin by itemId: ${err}`);
    }
}