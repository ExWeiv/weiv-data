import { memoize } from 'lodash';
import type { CollectionID } from '@exweiv/weiv-data'
import { kaptanLogar } from '../Errors/error_manager';
import { getWeivDataConfigs } from '../Config/weiv_data_config';

export const splitCollectionId = memoize(splitCollectionIdMain);
function splitCollectionIdMain(collectionId: CollectionID): { dbName: string, collectionName: string } {
    if (!collectionId || typeof collectionId !== "string") {
        kaptanLogar("00007");
    }

    const [dbName, collectionName] = collectionId.split('/');
    const { defaultDatabaseName } = getWeivDataConfigs();

    if (!dbName || !collectionName) {
        // When no dbname passed first value is the collection name so default db name is used here.
        return { dbName: defaultDatabaseName || "ExWeiv", collectionName: dbName };
    }

    return { dbName, collectionName };
}
