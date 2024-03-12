import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID, WeivDataOptions } from '../Helpers/collection';
import type { CreateCollectionOptions, Collection } from 'mongodb';

/**
 * Creates a new collection inside of a selected database. (User must have createCollection permission inside MongoDB dashboard, you can also use suppressAuth with options).
 * 
 * @example
 * ```js
 * import { createCollection } from '@exweiv/weiv-data';
 * 
 * createCollection('Database/NewCollectionName', { suppressAuth: true });
 * ```
 * 
 * @param collectionId CollectionID (< database >/< collection >). 
 * @param options An object containing options to use when processing this operation.
 * @param createOptions Native options of MongoDB driver when creating a collection. [Checkout here.](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/CreateCollectionOptions.html)
 * @returns {Promise<Collection>} Fulfilled - The Collection cursor of native MongoDB driver.
 */
export async function createCollection(collectionId: CollectionID, options?: WeivDataOptions, createOptions?: CreateCollectionOptions): Promise<Collection> {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }

        const { suppressAuth } = options || {};
        const { database } = await connectionHandler<true>(collectionId, suppressAuth);
        const { collectionName } = splitCollectionId(collectionId);
        return await database.createCollection(collectionName, createOptions);
    } catch (err) {
        throw Error(`WeivData - Error when creating a new collection in a database, details: ${err}`);
    }
}