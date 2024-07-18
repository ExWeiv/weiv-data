import { memoize } from 'lodash';
import type { CollectionID } from '@exweiv/weiv-data'
import { kaptanLogar } from '../Errors/error_manager';

export const splitCollectionId = memoize(splitCollectionIdMain);
function splitCollectionIdMain(collectionId: CollectionID): { dbName: string, collectionName: string } {
    if (!collectionId || typeof collectionId !== "string") {
        kaptanLogar("00007");
    }

    const [dbName, collectionName] = collectionId.split('/');

    if (!dbName || !collectionName) {
        return { dbName: "ExWeiv", collectionName: dbName };
    }

    return { dbName, collectionName };
}
