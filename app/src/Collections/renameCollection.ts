import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID, WeivDataOptions } from '../Helpers/collection';
import type { RenameOptions } from 'mongodb';

/**
 * Renames a collection inside of a selected database. (User must have renameCollection permission inside MongoDB dashboard, you can also use suppressAuth with options).
 * 
 * @example
 * ```js
 * import { renameCollection } from '@exweiv/weiv-data';
 * 
 * renameCollection('Database/ExistingCollectionName', 'NewCollectionName', { suppressAuth: true });
 * ```
 * 
 * @param collectionId CollectionID (< database >/< collection >). 
 * @param newCollectionName New name of collection.
 * @param options An object containing options to use when processing this operation.
 * @param renameOptions Native options of MongoDB driver when renaming a collection. [Checkout here.](https://mongodb.github.io/node-mongodb-native/6.5/classes/Db.html#renameCollection)
 * @returns {Promise<void>} void
 */
export async function renameCollection(collectionId: CollectionID, newCollectionName: string, options?: WeivDataOptions, renameOptions?: RenameOptions): Promise<void> {
    try {
        if (!collectionId || !newCollectionName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, newCollectionName`);
        }

        const { suppressAuth } = options || {};
        const { database } = await connectionHandler<true>(collectionId, suppressAuth, true);
        const { collectionName } = splitCollectionId(collectionId);
        await database.renameCollection(collectionName, newCollectionName, renameOptions);
    } catch (err) {
        throw Error(`WeivData - Error when renaming a collection, details: ${err}`);
    }
}