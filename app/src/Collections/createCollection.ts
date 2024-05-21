import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID } from '@exweiv/weiv-data';
import type { CreateCollectionOptions } from 'mongodb/mongodb';
import { validateParams } from '../Helpers/validator';

export async function createCollection(collectionId: CollectionID, suppressAuth?: boolean, createOptions?: CreateCollectionOptions): Promise<void> {
    try {
        const { safeCollectionOptions } = await validateParams<"createCollection">(
            { collectionId, collectionOptions: createOptions, suppressAuth },
            ["collectionId"],
            "createCollection"
        );

        const { database } = await connectionHandler(collectionId, suppressAuth);
        const { collectionName } = splitCollectionId(collectionId);
        await database.createCollection(collectionName, safeCollectionOptions);
    } catch (err) {
        throw new Error(`WeivData - Error when creating a new collection in a database, details: ${err}`);
    }
}