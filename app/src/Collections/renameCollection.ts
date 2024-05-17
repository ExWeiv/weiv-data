import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID, WeivDataOptions } from '@exweiv/weiv-data';
import type { RenameOptions } from 'mongodb/mongodb';
import { validateParams } from '../Helpers/validator';

export async function renameCollection(collectionId: CollectionID, newCollectionName: string, options?: WeivDataOptions, renameOptions?: RenameOptions): Promise<void> {
    try {
        const { safeCollectionOptions, safeOptions } = await validateParams<"renameCollection">(
            { collectionId, newCollectionName, options, collectionOptions: renameOptions },
            ["collectionId", "newCollectionName"],
            "renameCollection"
        );

        const { suppressAuth } = safeOptions || {};
        const { database } = await connectionHandler(collectionId, suppressAuth);
        const { collectionName } = splitCollectionId(collectionId);
        await database.renameCollection(collectionName, newCollectionName, safeCollectionOptions);
    } catch (err) {
        throw new Error(`WeivData - Error when renaming a collection, details: ${err}`);
    }
}