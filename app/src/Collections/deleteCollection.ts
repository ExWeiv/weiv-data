import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID, WeivDataOptions } from '@exweiv/weiv-data';
import type { DropCollectionOptions } from 'mongodb/mongodb';
import { validateParams } from '../Helpers/validator';

export async function deleteCollection(collectionId: CollectionID, options?: WeivDataOptions, deleteOptions?: DropCollectionOptions): Promise<boolean> {
    try {
        const { safeCollectionOptions, safeOptions } = await validateParams<"deleteCollection">(
            { collectionId, collectionOptions: deleteOptions, options },
            ["collectionId"],
            "deleteCollection"
        );

        const { suppressAuth } = safeOptions || {};
        const { database } = await connectionHandler(collectionId, suppressAuth);
        const { collectionName } = splitCollectionId(collectionId);
        return await database.dropCollection(collectionName, safeCollectionOptions);
    } catch (err) {
        throw new Error(`WeivData - Error when deleting a collection in a database, details: ${err}`);
    }
}