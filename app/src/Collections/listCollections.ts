import { connectionHandler } from '../Helpers/connection_helpers';
import { WeivDataOptions } from '@exweiv/weiv-data';
import type { Document, ListCollectionsOptions, CollectionInfo } from 'mongodb/mongodb';
import { validateParams } from '../Helpers/validator';

export async function listCollections(databaseName: string, options?: WeivDataOptions, filter?: Document, listOptions?: ListCollectionsOptions): Promise<CollectionInfo[]> {
    try {
        const { safeCollectionFilter, safeCollectionOptions, safeOptions } = await validateParams<"listCollections">(
            { databaseName, options, collectionFilter: filter, collectionOptions: listOptions },
            ["databaseName"],
            "listCollections"
        );

        const { suppressAuth } = safeOptions || {};
        const { database } = await connectionHandler(`${databaseName}/`, suppressAuth);
        return await database.listCollections(safeCollectionFilter, safeCollectionOptions).toArray();
    } catch (err) {
        throw new Error(`WeivData - Error when listing all collections in a database, details: ${err}`);
    }
}