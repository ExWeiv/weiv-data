import { useClient } from '../Connection/connection_provider';
import { splitCollectionId } from './name_helpers';
import { Db } from 'mongodb/mongodb';

export async function connectionHandler(collectionId: string, suppressAuth = false): Promise<ConnectionResult> {
    let db: Db | undefined;
    const { dbName, collectionName } = splitCollectionId(collectionId);
    const { pool, cleanup, memberId } = await useClient(suppressAuth);

    if (dbName) {
        db = pool.db(dbName);
    } else {
        db = pool.db("exweiv");
    }

    //@ts-ignore
    const collection = db.collection(collectionName);
    return { collection, cleanup, memberId };
}