import { CollectionID, WeivDataOptions } from '../Helpers/collection';
import { connectionHandler } from '../Helpers/connection_helpers';

/**
 * Removes all items from a collection.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * const result = await weivData.truncate("Clusters/Uskudar");
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to remove items from.
 * @param options An object containing options you can use when calling this function.
 * @returns {Promise<null>} Fulfilled - When the items have been removed. Rejected - The error that caused the rejection.
 */
export async function truncate(collectionId: CollectionID, options?: WeivDataOptions): Promise<null> {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }

        const { suppressAuth, cleanupAfter } = options || {};
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