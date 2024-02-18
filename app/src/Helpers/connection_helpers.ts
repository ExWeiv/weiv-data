//@ts-ignore
import * as customConnectionOptions from '../../../../../../../../../user-code/backend/WeivData/connection-options';
import { useClient } from '../Connection/automatic_connection_provider';
import { splitCollectionId } from './name_helpers';
import { Db, MongoClientOptions } from 'mongodb/mongodb';
import { type CollectionID, type ConnectionHandlerResult } from './collection';

const defaultOptions: MongoClientOptions = {
    tls: true,
}

export async function connectionHandler(collectionId: CollectionID, suppressAuth: boolean = false): Promise<ConnectionHandlerResult> {
    try {
        let db: Db | undefined;
        const { dbName, collectionName } = splitCollectionId(collectionId);
        const { pool, memberId } = await useClient(suppressAuth);

        if (dbName) {
            db = pool.db(dbName);
        } else {
            db = pool.db("exweiv");
        }

        const collection = db.collection(collectionName);
        return { collection, memberId };
    } catch (err) {
        throw Error(`WeivData - Error when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}

export type CustomOptionsRole = "adminClientOptions" | "memberClientOptions" | "visitorClientOptions";
export async function loadConnectionOptions(role: CustomOptionsRole): Promise<MongoClientOptions> {
    try {
        const customOptions: MongoClientOptions | undefined = customConnectionOptions[role];
        if (customOptions) {
            return customOptions;
        } else {
            return defaultOptions;
        }
    } catch (err) {
        throw Error(`WeivData - Error when returning options for MongoDB Client connection: ${err}`);
    }
}