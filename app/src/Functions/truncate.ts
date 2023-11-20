import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';

/**
 * @description Removes all items from a collection.
 * @param collectionId The ID of the collection to remove items from.
 * @param options An object containing options you can use when calling this function.
 * @returns Fulfilled - When the items have been removed. Rejected - The error that caused the rejection.
 */
export async function truncate(collectionId: string, options?: WeivDataOptions): Promise<null> {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when truncating a collection");
        }

        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        await collection.deleteMany({});

        if (cleanupAfter === true) {
            await cleanup();
        }

        return null;
    } catch (err) {
        console.error(err);
        return null;
    }
}