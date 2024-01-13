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
        console.error("Error when returning from setupClient function", err);
        return createNewClient(uri);
    }
}

const createNewClient = async (uri: string) => {
    const newMongoClient = new MongoClient(uri, await loadConnectionOptions());
    cachedMongoClient[uri] = newMongoClient;
    const { cleanup, connection } = await connectClient(newMongoClient, uri);

    if (connection) {
        return { cleanup, connection };
    } else {
        throw Error("Failed to connect to a MongoClient");
    }
}

const connectClient = async (client: MongoClient, uri: string): Promise<{ connection: MongoClient | undefined, cleanup: ConnectionCleanUp }> => {
    try {
        const connectedClient = await client.connect();
        return {
            connection: connectedClient,
            cleanup: () => { cachedMongoClient[uri]?.close(); }
        }
    } catch (err) {
        console.error("Failed to connect (MongoClient)", err);
        return {
            connection: undefined,
            cleanup: () => { cachedMongoClient[uri]?.close(); }
        }
    }
}

export async function useClient(suppressAuth = false): Promise<ClientSetupResult> {
    const { uri, memberId } = await getMongoURI(suppressAuth);
    const { connection, cleanup } = await setupClient(uri.value);
    return { pool: connection, cleanup, memberId };
}

export async function cleanupClientConnections(): Promise<void> {
    const allCachedClients = Object.keys(cachedMongoClient);

    for (const uri of allCachedClients) {
        cachedMongoClient[uri]?.close();
    }

    console.log("All MongoDB Cached Connections Closed and Cleared - Cached Clients Removed");
}