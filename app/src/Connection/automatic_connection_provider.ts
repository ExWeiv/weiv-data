import { MongoClient } from 'mongodb';
import { getMongoURI } from './permission_helpers';
import { loadConnectionOptions, type CustomOptionsRole } from '../Helpers/connection_helpers';
import { CacheableMemory } from 'cacheable';
import { kaptanLogar } from '../Errors/error_manager';

// MongoClient cache manabed by NodeCache with customizable options and a flag to check if we set event listeners for NodeCache expires/deletions
const clientCache = new CacheableMemory({ useClone: false, ttl: undefined });
let nodeCacheListeners: boolean = false;

async function setupClient(uri: string, role: CustomOptionsRole): Promise<MongoClient> {
    try {
        // Check if there is a cached MongoClient
        const cachedClient = clientCache.get<MongoClient>(uri.slice(14, 40));
        if (cachedClient) {
            // Return cached MongoClient
            return cachedClient;
        } else {
            // If there are no clients in cache create new one and return
            return createNewClient(uri, role);
        }
    } catch (err) {
        kaptanLogar("00009", `when connecting to MongoDB Client via setupClient: ${err}`);
    }
}

const createNewClient = async (uri: string, role: CustomOptionsRole): Promise<MongoClient> => {
    try {
        // Create a client and save it to cache
        const options = await loadConnectionOptions(role);
        const newMongoClient = new MongoClient(uri, options);

        // Connect this client to a server and save it to cache
        await connectClient(newMongoClient, uri);

        // Check if we already set any listener for expire and delete events of NodeCache
        if (!nodeCacheListeners) {
            // Bot on expire and deletion remove all event listeners of MongoClients and close the connections manually
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

            // Mark nodeCacheListeners as true so we won't handle it in future calls
            nodeCacheListeners = true;
        }

        // Return newly created and connected MongoClient
        return newMongoClient;
    } catch (err) {
        kaptanLogar("00009", `when creating a new MongoDB client: ${err}`);
    }
}

// Listeners Map for Caching
const listenersMap: Map<string, boolean> = new Map();
const connectClient = async (client: MongoClient, uri: string): Promise<MongoClient> => {
    try {
        // Check if this client has listeners
        if (!listenersMap.has(uri.slice(14, 40))) {

            // delete cached client and status on close event **so we know we need to reconnect again
            const handleClose = async () => {
                clientCache.delete(uri.slice(14, 40));
            };

            // delete cached client and status on error event and throw an error
            const handleError = async () => {
                clientCache.delete(uri.slice(14, 40));
                kaptanLogar("00009", `when trying to connect client (connection error): ${uri.slice(14, 40)}`); // Rethrow with URI for context
            };

            // Save listeners to this MongoClient
            client.on('close', handleClose);
            client.on('error', handleError);

            // Mark this MongoClient as listerners set
            listenersMap.set(uri.slice(14, 40), true);
        }

        // Connect this MongoClient to a server
        await client.connect();

        // Save this MongoClient to cache and set status as true
        clientCache.set(uri.slice(14, 40), client);

        // Return connected MongoClient
        return client;
    } catch (err) {
        kaptanLogar("00009", `Unexpected error when connecting MongoClient and setting listerners for MongoClient: ${err}`); // Handle unexpected errors gracefully
    }
};

export async function useClient(suppressAuth: boolean = false): Promise<{ pool: MongoClient, memberId?: string }> {
    try {
        const { uri, memberId, role } = await getMongoURI(suppressAuth);
        const pool = await setupClient(uri, role);
        return { pool, memberId };
    } catch (err) {
        kaptanLogar("00009", `when connecting to cached MongoClient via useClient: ${err}`);
    }
}

/**@internal */
export function getClientCache() {
    // Return NodeCache instance
    return clientCache;
}