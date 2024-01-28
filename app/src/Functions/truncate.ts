import { connectionHandler } from '../Helpers/connection_helpers';

/**
 * @description Removes all items from a collection.
 * @param collectionId The ID of the collection to remove items from.
 * @param options An object containing options you can use when calling this function.
 * @returns Fulfilled - When the items have been removed. Rejected - The error that caused the rejection.
 */
export async function truncate(collectionId: string, options?: WeivDataOptions): Promise<null> {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false};
        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged } = await collection.deleteMany({});

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged) {
            return null;
        } else {
            throw Error(`WeivData - Error when removing all items in a collection (truncate), acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing all items in a collection (truncate): ${err}`);
    }
}