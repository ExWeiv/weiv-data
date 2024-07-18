import { connectionHandler } from '../Helpers/connection_helpers';
import { splitCollectionId } from '../Helpers/name_helpers';
import { CollectionID } from '@exweiv/weiv-data';
import type { DropCollectionOptions } from 'mongodb/mongodb';
import { validateParams } from '../Helpers/validator';
import { kaptanLogar } from '../Errors/error_manager';

export async function deleteCollection(collectionId: CollectionID, suppressAuth?: boolean, deleteOptions?: DropCollectionOptions): Promise<boolean> {
    try {
        const { safeCollectionOptions } = await validateParams<"deleteCollection">(
            { collectionId, collectionOptions: deleteOptions, suppressAuth },
            ["collectionId"],
            "deleteCollection"
        );

        const { database } = await connectionHandler(collectionId, suppressAuth);
        const { collectionName } = splitCollectionId(collectionId);
        return await database.dropCollection(collectionName, safeCollectionOptions);
    } catch (err) {
        kaptanLogar("00022", `when deleting a collection in a database, details: ${err}`);
    }
}