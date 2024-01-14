import { useClient } from '../Connection/connection_provider';
import { splitCollectionId } from './name_helpers';
import { Db, MongoClientOptions } from 'mongodb/mongodb';
import { getCachedSecret } from './secret_helpers';
import { defaultsDeep } from 'lodash';

const defaultOptions: MongoClientOptions = {
    maxPoolSize: 40,
    minPoolSize: 1,
    maxIdleTimeMS: 30000
}

export async function connectionHandler(collectionId: string, suppressAuth = false): Promise<ConnectionResult> {
    try {
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
    } catch (err) {
        throw Error(`Error when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}

export async function loadConnectionOptions(): Promise<MongoClientOptions> {
    try {
        const optionsSecret = await getCachedSecret("WeivDataConnectionOptions");
        if (optionsSecret) {
            let customOptions = optionsSecret;

            if (customOptions) {
                if (typeof customOptions === "string") {
                    customOptions = await JSON.parse(customOptions);
                }
                return defaultsDeep(defaultOptions, customOptions);
            } else {
                return defaultOptions;
            }
        } else {
            return defaultOptions;
        }
    } catch (err) {
        throw Error(`Error when returning options for MongoDB Client connection: ${err}`);
    }
}