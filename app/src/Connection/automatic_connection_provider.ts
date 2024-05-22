import { MongoClient } from 'mongodb';
import { getMongoURI } from './permission_helpers';
import { loadConnectionOptions, type CustomOptionsRole } from '../Helpers/connection_helpers';
import NodeCache from 'node-cache';

/*
This is a global variable which will hold the cached (saved) clients that's already created before using same URI.
This will remove the cold start and make the process much more faster after first few calls.
*/
const clientCache = new NodeCache({ useClones: false, stdTTL: 10 * 60, deleteOnExpire: true });
const statusCache = new NodeCache({ useClones: false });
let listeners = false;
let manual = false;

async function setupClient(uri: string, role: CustomOptionsRole): Promise<MongoClient> {
    try {
        // Return existing client in cache
        const cachedClient = clientCache.get<MongoClient>(uri.slice(14, 40));
        if (cachedClient) {
            let connection = cachedClient;

            if (manual) {
                connection = await connectClient(cachedClient, uri);
            }

            if (connection) {
                return connection;
            } else {
                throw new Error(`there is a problem with client caching and it's a important problem please report it! This will directly impact to all operations`);
            }
        } else {
            // If there are no clients in cache create new one and return
            return createNewClient(uri, role);
        }
    } catch (err) {
        throw new Error(`Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}

const createNewClient = async (uri: string, role: CustomOptionsRole): Promise<MongoClient> => {
    try {
        // Create a client and save it to cache
        const options = await loadConnectionOptions(role);

        if (options.minPoolSize || options.maxPoolSize) {
            manual = true;
        }

        const newMongoClient = new MongoClient(uri, options);
        clientCache.set<MongoClient>(uri.slice(14, 40), newMongoClient);

        // Use connect function to connect to cluster using newly created client 
        let connection = newMongoClient;
        if (manual) {
            connection = await connectClient(newMongoClient, uri);
        }

        if (!listeners) {
            clientCache.on('expire', async (_key: string, client: MongoClient) => {
                client.removeAllListeners();
                await client.close();
                console.info("Client Expired and Connection Closed, Listeners Removed");
            });

            clientCache.on('del', async (_key: string, client: MongoClient) => {
                client.removeAllListeners();
                await client.close();
                console.info("Client Deleted and Connection Closed, Listeners Removed");
            });

            listeners = true;
        }

        if (connection) {
            return connection;
        } else {
            throw new Error(`Failed to connect to a MongoClient: connection: ${newMongoClient}`);
        }
    } catch (err) {
        throw new Error(`Error when creating a new MongoDB client: ${err}`);
    }
}

const listenersMap: Map<string, boolean> = new Map();
const connectClient = async (client: MongoClient, uri: string): Promise<MongoClient> => {
    try {
        const status = statusCache.get<boolean>(uri.slice(14, 40));
        const cachedClient = clientCache.get<MongoClient>(uri.slice(14, 40));

        // Check if a connection for the given URI exists in the cache
        if (status === true) {
            if (cachedClient) {
                return cachedClient;
            }
        }

        // Create a new client if not cached
        let connectedClient: MongoClient;

        if (!listenersMap.has(uri.slice(14, 40))) {
            const handleClose = async () => {
                clientCache.del(uri.slice(14, 40));
                statusCache.set<boolean>(uri.slice(14, 40), false);
            };

            const handleError = async () => {
                clientCache.del(uri.slice(14, 40));
                statusCache.set<boolean>(uri.slice(14, 40), false);
                throw new Error(`when trying to connect client (connection error): ${uri}`); // Rethrow with URI for context
            };

            client.on('close', handleClose);
            client.on('error', handleError);

            listenersMap.set(uri.slice(14, 40), true);
        }

        // Connect and return connection
        connectedClient = await client.connect();
        clientCache.set<MongoClient>(uri.slice(14, 40), connectedClient);
        statusCache.set<boolean>(uri.slice(14, 40), true);
        return connectedClient;
    } catch (err) {
        throw new Error(`Unexpected error: ${err}`); // Handle unexpected errors gracefully
    }
};

export async function useClient(suppressAuth: boolean = false): Promise<{ pool: MongoClient, memberId?: string }> {
    try {
        const { uri, memberId, role } = await getMongoURI(suppressAuth);
        const pool = await setupClient(uri, role);
        return { pool, memberId };
    } catch (err) {
        throw new Error(`when connecting to cached MongoClient via useClient: ${err}`);
    }
}

/**@internal */
export function getClientCache() {
    return clientCache;
}