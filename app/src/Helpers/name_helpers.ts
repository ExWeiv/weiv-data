import { memoize } from 'lodash';
import type { CollectionID } from '@exweiv/weiv-data'

export const splitCollectionId = memoize(splitCollectionIdMain);
function splitCollectionIdMain(collectionId: CollectionID): { dbName: string, collectionName: string } {
    if (!collectionId || typeof collectionId !== "string") {
        throw Error(`WeivData - CollectionID is Required with this syntax: <database>/<collection> and it must be a string!`);
    }

    const [dbName, collectionName] = collectionId.split('/');

    if (!dbName || !collectionName) {
        return { dbName: "ExWeiv", collectionName: dbName };
    }

    return { dbName, collectionName };
}
