//@ts-ignore
import * as customConnectionOptions from '../../../../../../../../../user-code/backend/WeivData/connection-options';

import { useClient } from '../Connection/automatic_connection_provider';
import { splitCollectionId } from './name_helpers';
import type { Collection, Db, MongoClientOptions } from 'mongodb/mongodb';
import type { CollectionID } from '@exweiv/weiv-data';
import type { Options } from 'node-cache';
import { logMessage } from './log_helpers';

export type ConnectionHandlerResult = {
    memberId?: string,
    collection: Collection,
    database: Db
}

export async function connectionHandler(collectionId: CollectionID, suppressAuth: boolean = false): Promise<ConnectionHandlerResult> {
    try {
        if (!collectionId || typeof collectionId !== "string") {
            throw new Error(`WeivData - Error when trying to connect to MongoClient, collectionId must be a string!`);
        }

        logMessage(`Connection Handler called via this collectionId: ${collectionId} and suppressAuth: ${suppressAuth}`);

        let db: Db | undefined;
        const { dbName, collectionName } = splitCollectionId(collectionId);
        const { pool, memberId } = await useClient(suppressAuth);

        if (dbName && typeof dbName === "string") {
            db = pool.db(dbName);
        } else {
            db = pool.db("ExWeiv");
        }

        logMessage("Connection handler retirivied the MongoClient and connected to the required database and collection");
        return { memberId, database: db, collection: db.collection(collectionName) };
    } catch (err) {
        throw new Error(`when trying to connect to database via useClient and Mongo Client ${err}`);
    }
}

export type CustomOptionsRole = "adminClientOptions" | "memberClientOptions" | "visitorClientOptions";
export async function loadConnectionOptions(role: CustomOptionsRole): Promise<MongoClientOptions> {
    try {
        if (role !== "adminClientOptions" && role !== "memberClientOptions" && role !== "visitorClientOptions") {
            throw new Error("type of role is not string!");
        }

        logMessage(`Loading custom connection options for MongoClient for role ${role}`);

        const customOptions: (() => MongoClientOptions | Promise<MongoClientOptions>) | undefined = customConnectionOptions[role];
        if (customOptions) {
            logMessage(`There are some custom options so loading them! for role ${role}`);
            return await customOptions();
        } else {
            logMessage(`There isn't any custom option loading default options for role ${role}`);
            return {
                tls: true,
            };
        }
    } catch (err) {
        throw new Error(`when returning options for MongoDB Client connection: ${err}`);
    }
}

export async function getCustomCacheRules() {
    try {
        logMessage(`Getting custom cache rules for MongoClient caching via Node-Cache`);
        const cacheRules: (() => Options | Promise<Options>) | undefined = customConnectionOptions["clientCacheRules"];
        if (cacheRules) {
            const loadedCacheRules = await cacheRules();
            logMessage(`There are some custom cache rules so loading them`, loadedCacheRules);
            return loadedCacheRules;
        } else {
            logMessage(`There isn't any custom cache rule so loading default rules`);
            return { useClones: false };
        }
    } catch (err) {
        throw new Error(`when loading custom cache rules for MongoClient connections, err: ${err}`);
    }
}