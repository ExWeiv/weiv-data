//@ts-ignore
import * as customConnectionOptions from '../../../../../../../../../user-code/backend/WeivData/connection-options';
import { useClient } from '../Connection/automatic_connection_provider';
import { splitCollectionId } from './name_helpers';
import { Db, MongoClientOptions } from 'mongodb/mongodb';
import { type CollectionID, type ConnectionHandlerResult } from './collection';
import { Options } from 'node-cache';

const defaultOptions: MongoClientOptions = {
    tls: true,
}

export async function connectionHandler<T extends boolean = false>(collectionId: CollectionID, suppressAuth: boolean = false, returnDb?: T): Promise<ConnectionHandlerResult<T>> {
    try {
        let db: Db | undefined;
        const { dbName, collectionName } = splitCollectionId(collectionId);
        const { pool, memberId } = await useClient(suppressAuth);

        if (dbName) {
            db = pool.db(dbName);
        } else {
            db = pool.db("ExWeiv");
        }

        if (returnDb === true && db) {
            return { memberId, database: db } as T extends true ? ConnectionHandlerResult<true> : ConnectionHandlerResult<false>;
        } else {
            const collection = db.collection(collectionName);
            return { collection, memberId, database: db } as T extends true ? ConnectionHandlerResult<true> : ConnectionHandlerResult<false>;
        }
    } catch (err) {
        throw Error(`WeivData - Error when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}

export type CustomOptionsRole = "adminClientOptions" | "memberClientOptions" | "visitorClientOptions";
export async function loadConnectionOptions(role: CustomOptionsRole): Promise<MongoClientOptions> {
    try {
        const customOptions: (() => MongoClientOptions | Promise<MongoClientOptions>) | undefined = customConnectionOptions[role];
        if (customOptions) {
            return await customOptions();
        } else {
            return defaultOptions;
        }
    } catch (err) {
        throw Error(`WeivData - Error when returning options for MongoDB Client connection: ${err}`);
    }
}

export async function getCustomCacheRules() {
    try {
        const cacheRules: (() => Options | Promise<Options>) | undefined = customConnectionOptions["clientCacheRules"];
        if (cacheRules) {
            return await cacheRules();
        } else {
            return { useClones: false, stdTTL: 5 * 60, deleteOnExpire: true };
        }
    } catch (err) {
        throw Error(`WeivData - Error when loading custom cache rules for MongoClient connections, err: ${err}`);
    }
}