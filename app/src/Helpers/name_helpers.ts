import { memoize } from 'lodash';
import type { CollectionID } from '@exweiv/weiv-data'
import { logMessage } from './log_helpers';

export const splitCollectionId = memoize(splitCollectionIdMain);
function splitCollectionIdMain(collectionId: CollectionID): { dbName: string, collectionName: string } {
    if (!collectionId || typeof collectionId !== "string") {
        throw new Error(`CollectionID is Required with this syntax: <database>/<collection> and it must be a string!`);
    }

    const [dbName, collectionName] = collectionId.split('/');

    if (!dbName || !collectionName) {
        return { dbName: "ExWeiv", collectionName: dbName };
    }

    logMessage(`splitCollectionIdMain function is called and here is the result for collectionName: ${collectionName} and dbName: ${dbName}`, collectionId);
    return { dbName, collectionName };
}
