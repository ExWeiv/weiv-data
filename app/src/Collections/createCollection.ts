import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID, WeivDataOptions } from '@exweiv/weiv-data';
import type { CreateCollectionOptions } from 'mongodb/mongodb';
import { validateParams } from '../Helpers/validator';

export async function createCollection(collectionId: CollectionID, options?: WeivDataOptions, createOptions?: CreateCollectionOptions): Promise<void> {
    try {
        const { safeCollectionOptions, safeOptions } = await validateParams<"createCollection">(
            { collectionId, collectionOptions: createOptions, options },
            ["collectionId"],
            "createCollection"
        );

        const { suppressAuth } = safeOptions || {};
        const { database } = await connectionHandler<true>(collectionId, suppressAuth, true);
        const { collectionName } = splitCollectionId(collectionId);
        await database.createCollection(collectionName, safeCollectionOptions);
    } catch (err) {
        throw new Error(`WeivData - Error when creating a new collection in a database, details: ${err}`);
    }
}