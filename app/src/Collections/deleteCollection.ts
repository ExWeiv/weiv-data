import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID, WeivDataOptions } from '../Helpers/collection';
import type { DropCollectionOptions } from 'mongodb';

/**
 * Deletes a collection inside of a selected database. (User must have dropCollection permission inside MongoDB dashboard, you can also use suppressAuth with options).
 * 
 * @param collectionId CollectionID (<database>/<collection>). 
 * @param collectionOptions Native options of MongoDB driver when deleting a collection. [Checkout here.](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/DropCollectionOptions.html)
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<boolean>} Fulfilled - True if succeed.
 */
export async function deleteCollection(collectionId: CollectionID, collectionOptions?: DropCollectionOptions, options?: WeivDataOptions): Promise<boolean> {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }

        const { suppressAuth } = options || {};
        const { database } = await connectionHandler<true>(collectionId, suppressAuth);
        const { collectionName } = splitCollectionId(collectionId);
        return await database.dropCollection(collectionName, collectionOptions);
    } catch (err) {
        throw Error(`WeivData - Error when deleting a collection, details: ${err}`);
    }
}