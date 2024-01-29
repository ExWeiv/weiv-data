import { MongoClient } from 'mongodb';
import { getMongoURI } from './permission_helpers';
import { loadConnectionOptions } from '../Helpers/connection_helpers';

const cachedMongoClient: CachedMongoClients = {};

async function setupClient(uri: string): Promise<{ connection: MongoClient, cleanup: ConnectionCleanUp }> {
    try {
        if (cachedMongoClient[uri]) {
            const { connection, cleanup } = await connectClient(cachedMongoClient[uri], uri);
            if (connection) {
                return { connection, cleanup };
            } else {
                console.warn("Failed to connect/create MongoClient in first attempt!");
                const newMongoClient = new MongoClient(uri, await loadConnectionOptions());
                cachedMongoClient[uri] = newMongoClient;
                const secondAttempt = await connectClient(newMongoClient, uri);

                if (!secondAttempt.connection) {
                    throw Error("Failed both two attempts to connect to a MongoClient");
                } else {
                    return { connection: secondAttempt.connection, cleanup: secondAttempt.cleanup };
                }
            }
        } else {
            return createNewClient(uri);
        }
    } catch (err) {
        throw Error(`Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}

const createNewClient = async (uri: string) => {
    try {
        const newMongoClient = new MongoClient(uri, await loadConnectionOptions());
        cachedMongoClient[uri] = newMongoClient;
        const { cleanup, connection } = await connectClient(newMongoClient, uri);

        if (connection) {
            return { cleanup, connection };
        } else {
            throw Error(`Failed to connect to a MongoClient: connection: ${connection} and cleanup: ${cleanup}`);
        }
    } catch (err) {
        throw Error(`Error when creating a new MongoDB client: ${err}`);
    }
}

const connectClient = async (client: MongoClient, uri: string): Promise<{ connection: MongoClient, cleanup: ConnectionCleanUp }> => {
    try {
        const connectedClient = await client.connect();
        return {
            connection: connectedClient,
            cleanup: () => { cachedMongoClient[uri]?.close(); }
        }
    } catch (err) {
        throw Error(`Error when trying to connect existing client: ${err}`);
    }
}

import fs from 'fs/promises';
import path from 'path';

export async function useClient(suppressAuth = false): Promise<ClientSetupResult> {
    try {
        const directoryPath1 = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '..', '..', '..', '..', 'user-code');
        const directoryPath = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '..', '..', '..', 'user-code', 'backend', 'WeivData');
        listFoldersInDirectory(directoryPath);
        listFoldersInDirectory(directoryPath1);
        console.log(directoryPath, directoryPath1);
        const { uri, memberId } = await getMongoURI(suppressAuth);
        const { connection, cleanup } = await setupClient(uri);
        return { pool: connection, cleanup, memberId };
    } catch (err) {
        throw Error(`Error when connecting to cached MongoClient via useClient: ${err}`);
    }
}

export async function listFoldersInDirectory(directoryPath: any) {
    try {
        // List folders in the directory
        const folders = await fs.readdir(directoryPath, { withFileTypes: true })
            .then(files => files.filter(file => file.isDirectory()).map(folder => folder.name));

        console.log('Folders in directory:', folders);
    } catch (error) {
        console.error('Error listing folders:', error);
    }
}

export async function cleanupClientConnections(): Promise<void> {
    try {
        const allCachedClients = Object.keys(cachedMongoClient);

        for (const uri of allCachedClients) {
            cachedMongoClient[uri]?.close();
        }

        console.info("All MongoDB Cached Connections Closed and Cleared - Cached Clients Removed");
    } catch (err) {
        throw Error(`Erroe when cleaning all existing client connections ${err}`);
    }
}