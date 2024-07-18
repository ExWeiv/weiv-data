//@ts-ignore
import * as customConnectionOptions from '../../../../../../../../../user-code/backend/WeivData/connection-options';
import { useClient } from '../Connection/automatic_connection_provider';
import { splitCollectionId } from './name_helpers';
import type { Collection, Db, MongoClientOptions } from 'mongodb/mongodb';
import type { CollectionID } from '@exweiv/weiv-data';
import type { Options } from 'node-cache';
import { kaptanLogar } from '../Errors/error_manager';

export type ConnectionHandlerResult = {
    memberId?: string,
    collection: Collection,
    database: Db
}

export async function connectionHandler(collectionId: CollectionID, suppressAuth: boolean = false): Promise<ConnectionHandlerResult> {
    try {
        if (!collectionId || typeof collectionId !== "string") {
            kaptanLogar("00007");
        }

        let db: Db | undefined;
        const { dbName, collectionName } = splitCollectionId(collectionId);
        const { pool, memberId } = await useClient(suppressAuth);

        if (dbName && typeof dbName === "string") {
            db = pool.db(dbName);
        } else {
            db = pool.db("ExWeiv");
        }

        return { memberId, database: db, collection: db.collection(collectionName) };
    } catch (err) {
        kaptanLogar("00009", `when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}

export type CustomOptionsRole = "adminClientOptions" | "memberClientOptions" | "visitorClientOptions";
export async function loadConnectionOptions(role: CustomOptionsRole): Promise<MongoClientOptions> {
    try {
        if (role !== "adminClientOptions" && role !== "memberClientOptions" && role !== "visitorClientOptions") {
            kaptanLogar("00009", "type of role is not string!");
        }

        const customOptions: (() => MongoClientOptions | Promise<MongoClientOptions>) | undefined = customConnectionOptions[role];
        if (customOptions) {
            return await customOptions();
        } else {
            return {
                tls: true,
            };
        }
    } catch (err) {
        kaptanLogar("00009", `when returning options for MongoDB Client connection: ${err}`);
    }
}

export async function getCustomCacheRules() {
    try {
        const cacheRules: (() => Options | Promise<Options>) | undefined = customConnectionOptions["clientCacheRules"];
        if (cacheRules) {
            const loadedCacheRules = await cacheRules();
            return loadedCacheRules;
        } else {
            return { useClones: false };
        }
    } catch (err) {
        kaptanLogar("00009", `when loading custom cache rules for MongoClient connections ${err}`);
    }
}