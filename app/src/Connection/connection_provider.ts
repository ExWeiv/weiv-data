import { MongoClient, MongoClientOptions } from 'mongodb';
import _ from 'lodash';
import { getMemberURI } from './permission_helpers';

const customOptions: MongoClientOptions = {
    maxIdleTimeMS: 15000,
    maxPoolSize: 3
}

const getCustomOptions = (): MongoClientOptions => {
    if (!process.env.MONGO_CLIENT_OPTIONS) {
        process.env.MONGO_CLIENT_OPTIONS = JSON.stringify(customOptions);
    }

    // Default options - https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connection-options/
    let customOptions: MongoClientOptions = {};
    const defaultOptions: MongoClientOptions = {
        tls: true,
        ssl: true,
        appName: "ExWeiv MongoDB Velo APIs",
        w: "majority",
        retryWrites: true
    };

    if (process.env.MONGO_CLIENT_OPTIONS) {
        customOptions = JSON.parse(process.env.MONGO_CLIENT_OPTIONS) || {};
    }

    return _.defaultsDeep(customOptions, defaultOptions);
}

const notConnectedPool = (err: any): MongoStubPool => ({
    db: () => { throw err },
    close: async () => { },
})

const emptyClient = (): MongoStubClient => ({
    connect: async () => notConnectedPool(new Error('No URI was provided')),
})

let savedClients: { [uri: string]: { client: MongoClient | MongoStubClient, cleanup?: ConnectionCleanUp } } = {};

/**
 * @description Creates or uses an existing `MongoClient` for db operations. This function also creates different clients for different roles. If admin rol client already created then system will use existing if not it will create one and save it.
 * @param uri Connection URI to connect MongoDB Cluster (Options are predefined but you can add more with URI options)
 * @returns A `MongoClient` and a cleanup function to close connection when the job is done.
 */
async function setupClient(uri: string, newConnection: boolean = false): Promise<{ pool: MongoClient | MongoStubPool, cleanup: ConnectionCleanUp }> {
    if (newConnection) {
        const newClient = uri ? new MongoClient(uri, getCustomOptions()) : emptyClient();
        _.set(savedClients, [uri, 'client'], newClient);
    }

    if (!savedClients[uri] && newConnection != true) {
        const newClient = uri ? new MongoClient(uri, getCustomOptions()) : emptyClient();
        _.set(savedClients, [uri, 'client'], newClient);
    }

    const { pool, cleanup }: { pool: MongoClient | MongoStubPool, cleanup: ConnectionCleanUp } = await savedClients[uri].client.connect()
        .then((res: MongoClient | MongoStubPool) => {
            return {
                pool: res,
                cleanup: async (): Promise<void> => {
                    delete savedClients[uri];
                    await pool.close();
                }
            }
        }).catch(err => {
            return { pool: notConnectedPool(err), cleanup: async () => { } }
        })

    savedClients[uri].cleanup = async (): Promise<void> => { await cleanup() };
    return { pool, cleanup };
}

// Cached setupClient function to improve performance
const memoizedSetupClient = _.memoize(setupClient);

/**
 * @description Creates or uses an existing `MongoClient` for db operations.
 * @param suppressAuth Permission bypass option if needed. (Direct Admin Role)
 * @returns An object with `{ pool, cleanup, member }` `memberId` is optional and not returned always.
 * @example
 * ```typescript
 * import { useClient } from '<file-path>';
 * 
 * const { client, cleanup, memberId } = useClient(suppressAuth);
 * // Handle the rest
 * ```
 */
export async function useClient(suppressAuth = false): Promise<ClientSetupResult> {
    console.log("Connecting to MongoDB Cluster...");
    const { uri, memberId } = await getMemberURI(suppressAuth);
    // const uri = process.env.URI || "";
    // const memberId = undefined;

    if (savedClients[uri]) {
        const { pool, cleanup } = await memoizedSetupClient(uri, false);
        return { pool, cleanup, memberId };
    } else {
        const { pool, cleanup } = await setupClient(uri, true);
        return { pool, cleanup, memberId };
    }
}

/**
 * @description Closes all connections to MongoDB server (client.close). (Not required, all connections are closed if they are idle after 15sec)
 * @example
 * ```typescript
 * import { cleanup } from '@exweiv/weivData';
 * 
 * await cleanup();
 * ```
 */
export async function cleanupClientConnections(): Promise<void> {
    const clients = Object.keys(savedClients);

    if (clients.length > 0) {
        _.forEach(savedClients, async (data) => {
            if (data.cleanup) await data.cleanup();
        });
    }

    savedClients = {};
    console.log("All MongoDB Connections Closed and Cleared - Cached Clients Removed");
}