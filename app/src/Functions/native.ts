import { connectionHandler } from '../Helpers/connection_helpers';
import type { CollectionID } from '@exweiv/weiv-data';
import { Collection } from 'mongodb/mongodb';
import { validateParams } from '../Helpers/validator';
import { kaptanLogar } from '../Errors/error_manager';

export async function native(collectionId: CollectionID, suppressAuth?: boolean): Promise<Collection> {
    try {
        await validateParams<"native">({ collectionId }, ["collectionId"], "native");
        const { collection } = await connectionHandler(collectionId, suppressAuth);
        return collection;
    } catch (err) {
        kaptanLogar("00018", `when returning native collection cursor from mongodb driver: ${err}`);
    }
}