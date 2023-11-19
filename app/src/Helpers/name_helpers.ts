import { memoize } from 'lodash';

/**
 * @description Get database and collection name from single string
 * @param text Database name and collection name splited by `/`
 * @returns `dbName` and `collectionName`
 */
export const splitCollectionId = memoize(splitCollectionIdMain);

function splitCollectionIdMain(collectionId: string): { dbName: string, collectionName: string } {
    const [dbName, collectionName] = collectionId.split('/');

    if (!dbName || !collectionName) {
        return { dbName: "ExWeiv", collectionName: dbName };
    }

    return { dbName, collectionName };
}
