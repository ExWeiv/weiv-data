import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID, WeivDataOptions } from '../Helpers/collection';
import type { CreateCollectionOptions, Collection } from 'mongodb';

/**
 * Creates a new collection inside of a selected database. (User must have createCollection permission inside MongoDB dashboard, you can also use suppressAuth with options).
 * 
 * @param collectionId CollectionID (<database>/<collection>). 
 * @param collectionOptions Native options of MongoDB driver when creating a collection. [Checkout here.](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/CreateCollectionOptions.html)
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Collection>} Fulfilled - The Collection cursor of native MongoDB driver.
 */
export async function createCollection(collectionId: CollectionID, collectionOptions?: CreateCollectionOptions, options?: WeivDataOptions): Promise<Collection> {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }

        const { suppressAuth } = options || {};
        const { database } = await connectionHandler<true>(collectionId, suppressAuth);
        const { collectionName } = splitCollectionId(collectionId);
        return await database.createCollection(collectionName, collectionOptions);
    } catch (err) {
        throw Error(`WeivData - Error when creating a new collection, details: ${err}`);
    }
}