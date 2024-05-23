import { MongoClient } from 'mongodb';
import { getMongoURI } from './permission_helpers';
import { loadConnectionOptions, type CustomOptionsRole } from '../Helpers/connection_helpers';
import NodeCache from 'node-cache';
import { logMessage } from '../Helpers/log_helpers';

/*
This is a global variable which will hold the cached (saved) clients that's already created before using same URI.
This will remove the cold start and make the process much more faster after first few calls.
*/
const clientCache = new NodeCache({ useClones: false });
const statusCache = new NodeCache({ useClones: false });
let listeners = false;
let manual = false;

async function setupClient(uri: string, role: CustomOptionsRole): Promise<MongoClient> {
    try {
        await logMessage(`Setting up a new or existing MongoClient for database a operation, for role: ${role} with URI: ${uri.slice(14, 40)} (URI is sliced for security reasons)`);

        // Return existing client from cache
        const cachedClient = clientCache.get<MongoClient>(uri.slice(14, 40));
        if (cachedClient) {
            await logMessage(`We have found a cached MongoClient so we will use it instead of creating new one!`, cachedClient);
            let connection = cachedClient;

            if (manual) {
                await logMessage(`Since there are some custom connection options that effects to connection pool we will call connectClient to be safe, manual: ${manual}`, connection);
                connection = await connectClient(cachedClient, uri);
            }

            if (connection) {
                await logMessage(`Connection of MongoClient is ready and now returned with setupClient function`, connection);
                return connection;
            } else {
                throw new Error(`there is a problem with client caching and it's a important problem please report it! This will directly impact to all operations`);
            }
        } else {
            // If there are no clients in cache create new one and return
            await logMessage(`No cached MongoClients found so we are creating new MongoClient for role: ${role} with URI: ${uri.slice(14, 40)}`);
            return createNewClient(uri, role);
        }
    } catch (err) {
        throw new Error(`Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}

const createNewClient = async (uri: string, role: CustomOptionsRole): Promise<MongoClient> => {
    try {
        await logMessage(`Creating new MongoClient for URI: ${uri.slice(14, 40)} with role: ${role}`);

        // Create a client and save it to cache
        const options = await loadConnectionOptions(role);

        if (options.minPoolSize || options.maxPoolSize) {
            await logMessage(`There are some options for MongoClient (either minPoolSize or maxPoolSize) that effects to connection pool so we set manual to true`, options);
            manual = true;
        }

        const newMongoClient = new MongoClient(uri, options);
        clientCache.set<MongoClient>(uri.slice(14, 40), newMongoClient);
        await logMessage(`New MongoClient created with selected options and URI`, newMongoClient);

        // Use connect function to connect to cluster using newly created client 
        let connection = newMongoClient;
        if (manual) {
            await logMessage(`Since manual is enabled we will connect to MongoDB so we are calling connectClient`, connection);
            connection = await connectClient(newMongoClient, uri);
        }

        if (!listeners) {
            await logMessage(`We didn't set any listerners for MongoClient to clear event listeners so we are setting event listeners, value: ${!listeners}`);

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
            await logMessage(`Newly created and connected MongoClient is now returned with createNewClient function!`, connection);
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
        await logMessage(`connectClient function is called with this URI: ${uri.slice(14, 40)}`, client);

        const status = statusCache.get<boolean>(uri.slice(14, 40));
        const cachedClient = clientCache.get<MongoClient>(uri.slice(14, 40));

        // Check if a connection for the given URI exists in the cache
        if (status === true) {
            await logMessage(`Status cache is filled so it's true`);
            if (cachedClient) {
                await logMessage(`There is also cached MongoClient so it's also true and we are returning the cached MongoClient`);
                return cachedClient;
            }
        }

        await logMessage(`Creating new MongoClient inside connectClient function since we don't have any in cache`);

        if (!listenersMap.has(uri.slice(14, 40))) {
            await logMessage(`Setting up MongoClient event listeners for close and error events`);

            const handleClose = async () => {
                clientCache.del(uri.slice(14, 40));
                statusCache.set<boolean>(uri.slice(14, 40), false);
            };

            const handleError = async () => {
                clientCache.del(uri.slice(14, 40));
                statusCache.set<boolean>(uri.slice(14, 40), false);
                throw new Error(`when trying to connect client (connection error): ${uri.slice(14, 40)}`); // Rethrow with URI for context
            };

            client.on('close', handleClose);
            client.on('error', handleError);

            listenersMap.set(uri.slice(14, 40), true);
        }

        // Connect and return connection
        await client.connect();
        await logMessage(`We have now connected to MongoClient via .connect method`, client);

        clientCache.set<MongoClient>(uri.slice(14, 40), client);
        statusCache.set<boolean>(uri.slice(14, 40), true);
        await logMessage(`We have saved client and status to cache so we won't create new MongoClient/s for each call. And we return the connectedClient`, { clientCache, statusCache });

        return client;
    } catch (err) {
        throw new Error(`Unexpected error: ${err}`); // Handle unexpected errors gracefully
    }
};

export async function useClient(suppressAuth: boolean = false): Promise<{ pool: MongoClient, memberId?: string }> {
    try {
        await logMessage(`useClient function is called and now we will first get the connection URI and then setup the MongoClient via setupClient, permission bypass is: ${suppressAuth}`);
        const { uri, memberId, role } = await getMongoURI(suppressAuth);
        const pool = await setupClient(uri, role);
        await logMessage(`useClient job has completed and now we return the MongoClient and memberId is exists`, { memberId, client: pool });
        return { pool, memberId };
    } catch (err) {
        throw new Error(`when connecting to cached MongoClient via useClient: ${err}`);
    }
}

/**@internal */
export function getClientCache() {
    logMessage(`MongoClient cache is requested`, clientCache);
    return clientCache;
}