import { MongoClient } from 'mongodb';
import { getMongoURI } from './permission_helpers';
import { loadConnectionOptions } from '../Helpers/connection_helpers';
import { CachedMongoClients, SetupClientResult, SuppressAuth, UseClientResult } from '../../weivdata';

/*
This is a global variable which will hold the cached (saved) clients that's already created before using same URI.
This will remove the cold start and make the process much more faster after first few calls.
*/
const cachedMongoClient: CachedMongoClients = {};

/**
 * @function
 * @description Function to setup a MongoDB client or use one from cache. Cached clients are removed when the container closed in the Wix side.
 * 
 * @param uri URI to use when connecting to MongoDB Cluster
 * @returns {SetupClientResult}
 */
async function setupClient(uri: string): Promise<SetupClientResult> {
    try {
        if (cachedMongoClient[uri]) {
            const { connection, cleanup } = await connectClient(cachedMongoClient[uri], uri);
            if (connection) {
                return { connection, cleanup };
            } else {
                // If first attempt fails try to create the client again and use new connection
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
            // If there are no clients in cache create new one and return
            return createNewClient(uri);
        }
    } catch (err) {
        throw Error(`Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}

/**
 * @function
 * @description Function to create a new client if there are no clients in cache.
 * 
 * @param uri URI to use when connecting to MongoDB Cluster
 * @returns {SetupClientResult}
 */
const createNewClient = async (uri: string): Promise<SetupClientResult> => {
    try {
        // Create a client and save it to cache
        const newMongoClient = new MongoClient(uri, await loadConnectionOptions());
        cachedMongoClient[uri] = newMongoClient;

        // Use connect function to connect to cluster using newly created client 
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

/**
 * @function
 * @description A function to connect cluster server via created MongoDB client. Returns connection and cleanup function.
 * 
 * @param client MongoDB Client
 * @param uri URI to use when connecting to MongoDB Cluster
 * @returns {SetupClientResult}
 */
const connectClient = async (client: MongoClient, uri: string): Promise<SetupClientResult> => {
    try {
        // Connect and return connection
        const connectedClient = await client.connect();
        return {
            connection: connectedClient,
            cleanup: () => { cachedMongoClient[uri]?.close(); }
        }
    } catch (err) {
        throw Error(`Error when trying to connect existing client: ${err}`);
    }
}

/**
 * @function
 * @description Function to use a cached client or a new client connection. This function is used before an operation made in Cluster.
 * 
 * @param suppressAuth 
 * @returns 
 */
export async function useClient(suppressAuth: SuppressAuth = false): Promise<UseClientResult> {
    try {
        const { uri, memberId } = await getMongoURI(suppressAuth);
        const { connection, cleanup } = await setupClient(uri);
        return { pool: connection, cleanup, memberId };
    } catch (err) {
        throw Error(`Error when connecting to cached MongoClient via useClient: ${err}`);
    }
}

/**
 * @function
 * @description Function to cleanup all existing connections using a for loop.
 */
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