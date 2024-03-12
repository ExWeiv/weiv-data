import { connectionHandler } from '../Helpers/connection_helpers';
import { WeivDataOptions } from '../Helpers/collection';
import type { ListCollectionsCursor, Document, ListCollectionsOptions } from 'mongodb';

/**
 * Lists collections inside of a selected database. (User must have listCollections permission inside MongoDB dashboard, you can also use suppressAuth with options).
 * 
 * @param databaseName Database name that you want to get the collections of.
 * @param options An object containing options to use when processing this operation.
 * @param filter MongoDB native filtering options. [Read more in native docs.](https://mongodb.github.io/node-mongodb-native/6.5/classes/Db.html#listCollections)
 * @param listOptions MongoDB native listCollections options. [Read more in native docs.](https://mongodb.github.io/node-mongodb-native/6.5/classes/Db.html#listCollections)
 * @returns {Promise<ListCollectionsCursor>} Fulfilled - Native ListCollectionsCursor of MongoDB driver.
 */
export async function listCollections(databaseName: string, options?: WeivDataOptions, filter?: Document, listOptions?: ListCollectionsOptions): Promise<ListCollectionsCursor> {
    try {
        if (!databaseName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: databaseName`);
        }

        const { suppressAuth } = options || {};
        const { database } = await connectionHandler<true>(`${databaseName}/`, suppressAuth);
        return await database.listCollections(filter, listOptions);
    } catch (err) {
        throw Error(`WeivData - Error when listing all collections in a database, details: ${err}`);
    }
}