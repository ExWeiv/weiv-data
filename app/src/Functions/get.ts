import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb'

/**
 * @description Retrieves an item from a collection.
 * @param collectionId The ID of the collection to retrieve the item from.
 * @param itemId The ID of the item to retrieve.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The retrieved item or null if not found. Rejected - The error that caused the rejection.
 */
export async function get(collectionId: string, itemId: ObjectId | string, options?: WeivDataOptions): Promise<object | null> {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when getting an item from a collection");
        }

        if (!itemId) {
            reportError("ItemId is required when getting an item from a collection");
        }

        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        itemId = convertStringId(itemId);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: itemId }, { readConcern: consistentRead === true ? "majority" : "local" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (!item) {
            reportError("Item not found in collection");
        }

        return item;
    } catch (err) {
        console.error(err); //@ts-ignore
        return err;
    }
}