import { connectionHandler } from '../Helpers/connection_helpers';
import type { Document, ListCollectionsOptions, CollectionInfo } from 'mongodb/mongodb';
import { validateParams } from '../Helpers/validator';

export async function listCollections(databaseName: string, suppressAuth?: boolean, filter?: Document, listOptions?: ListCollectionsOptions): Promise<CollectionInfo[]> {
    try {
        const { safeCollectionFilter, safeCollectionOptions } = await validateParams<"listCollections">(
            { databaseName, suppressAuth, collectionFilter: filter, collectionOptions: listOptions },
            ["databaseName"],
            "listCollections"
        );

        const { database } = await connectionHandler(`${databaseName}/`, suppressAuth);
        return await database.listCollections(safeCollectionFilter, safeCollectionOptions).toArray();
    } catch (err) {
        throw new Error(`WeivData - Error when listing all collections in a database, details: ${err}`);
    }
}