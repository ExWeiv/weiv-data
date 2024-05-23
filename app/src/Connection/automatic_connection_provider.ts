import { MongoClient } from 'mongodb';
import { getMongoURI } from './permission_helpers';
import { loadConnectionOptions, type CustomOptionsRole } from '../Helpers/connection_helpers';
import NodeCache from 'node-cache';
import { logMessage } from '../Helpers/log_helpers';

// MongoClient cache manabed by NodeCache with customizable options and a flag to check if we set event listeners for NodeCache expires/deletions
const clientCache = new NodeCache({ useClones: false });
let nodeCacheListeners: boolean = false;

async function setupClient(uri: string, role: CustomOptionsRole): Promise<MongoClient> {
    try {
        logMessage(`Setting up a new or existing MongoClient for database a operation, for role: ${role} with URI: ${uri.slice(14, 40)} (URI is sliced for security reasons)`);

        // Check if there is a cached MongoClient
        const cachedClient = clientCache.get<MongoClient>(uri.slice(14, 40));
        if (cachedClient) {
            // Return cached MongoClient
            logMessage(`Connection of MongoClient is ready and now returned with setupClient function`, cachedClient);
            return cachedClient;
        } else {
            // If there are no clients in cache create new one and return
            logMessage(`No cached MongoClients found so we are creating new MongoClient for role: ${role} with URI: ${uri.slice(14, 40)}`);
            return createNewClient(uri, role);
        }
    } catch (err) {
        throw new Error(`Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}

const createNewClient = async (uri: string, role: CustomOptionsRole): Promise<MongoClient> => {
    try {
        logMessage(`Creating new MongoClient for URI: ${uri.slice(14, 40)} with role: ${role}`);

        // Create a client and save it to cache
        const options = await loadConnectionOptions(role);
        const newMongoClient = new MongoClient(uri, options);
        logMessage(`New MongoClient created with selected options and URI`, newMongoClient);
        
        // Connect this client to a server and save it to cache
        await connectClient(newMongoClient, uri);

        // Check if we already set any listener for expire and delete events of NodeCache
        if (!nodeCacheListeners) {
            logMessage(`We didn't set any listerners for MongoClient to clear event listeners so we are setting event listeners, value: ${!nodeCacheListeners}`);

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
        throw new Error(`Error when creating a new MongoDB client: ${err}`);
    }
}

// Listeners Map for Caching
const listenersMap: Map<string, boolean> = new Map();
const connectClient = async (client: MongoClient, uri: string): Promise<MongoClient> => {
    try {
        logMessage(`connectClient function is called with this URI: ${uri.slice(14, 40)}`, client);

        // Check if this client has listeners
        if (!listenersMap.has(uri.slice(14, 40))) {
            logMessage(`Setting up MongoClient event listeners for close and error events`);

            // delete cached client and status on close event **so we know we need to reconnect again
            const handleClose = async () => {
                clientCache.del(uri.slice(14, 40));
            };

            // delete cached client and status on error event and throw an error
            const handleError = async () => {
                clientCache.del(uri.slice(14, 40));
                throw new Error(`when trying to connect client (connection error): ${uri.slice(14, 40)}`); // Rethrow with URI for context
            };

            // Save listeners to this MongoClient
            client.on('close', handleClose);
            client.on('error', handleError);

            // Mark this MongoClient as listerners set
            listenersMap.set(uri.slice(14, 40), true);
        }

        // Connect this MongoClient to a server
        await client.connect();
        logMessage(`We have now connected to MongoClient via .connect method`, client);

        // Save this MongoClient to cache and set status as true
        clientCache.set<MongoClient>(uri.slice(14, 40), client);

        // Return connected MongoClient
        logMessage(`We have saved client and status to cache so we won't create new MongoClient/s for each call. And we return the connectedClient`, clientCache);
        return client;
    } catch (err) {
        throw new Error(`Unexpected error when connecting MongoClient and setting listerners for MongoClient: ${err}`); // Handle unexpected errors gracefully
    }
};

export async function useClient(suppressAuth: boolean = false): Promise<{ pool: MongoClient, memberId?: string }> {
    try {
        logMessage(`useClient function is called and now we will first get the connection URI and then setup the MongoClient via setupClient, permission bypass is: ${suppressAuth}`);
        const { uri, memberId, role } = await getMongoURI(suppressAuth);
        const pool = await setupClient(uri, role);
        logMessage(`useClient job has completed and now we return the MongoClient and memberId is exists`, { memberId, client: pool });
        return { pool, memberId };
    } catch (err) {
        throw new Error(`when connecting to cached MongoClient via useClient: ${err}`);
    }
}

/**@internal */
export function getClientCache() {
    // Return NodeCache instance
    logMessage(`MongoClient cache is requested`, clientCache);
    return clientCache;
}