import { MongoClient } from 'mongodb';
import { getMongoURI } from './permission_helpers';
import { loadConnectionOptions, type CustomOptionsRole } from '../Helpers/connection_helpers';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import { getSecretKey } from '../Helpers/encrypt_helpers';

const clientCache = new NodeCache({ deleteOnExpire: true });
let expireListener = false;

/**@internal */
export type UseClientResult = {
    pool: MongoClient,
    memberId?: string
}

async function setupClient(uri: string, role: CustomOptionsRole): Promise<MongoClient> {
    try {
        const cachedClient = clientCache.get<MongoClient>(await encryptURI(uri));
        if (cachedClient) {
            // If there is a cached client then return it.
            return cachedClient;
        } else {
            // If there are no clients in cache create new one and return.
            return createNewClient(uri, role);
        }
    } catch (err) {
        throw Error(`WeivData - Error when connecting to MongoDB Client via setupClient: ${err}`);
    }
}

const createNewClient = async (uri: string, role: CustomOptionsRole): Promise<MongoClient> => {
    try {
        // Create a client and save it to cache
        const newMongoClient = new MongoClient(uri, await loadConnectionOptions(role));
        clientCache.set<MongoClient>(await encryptURI(uri), newMongoClient, 60 * 5);

        if (!expireListener) {
            clientCache.on('expired', async (_key: string, value: MongoClient) => {
                await value.close();
            })
        }

        return newMongoClient;
    } catch (err) {
        throw Error(`WeivData - Error when creating a new MongoDB client: ${err}`);
    }
}

/**@internal */
export async function useClient(suppressAuth: boolean = false): Promise<UseClientResult> {
    try {
        const { uri, memberId, role } = await getMongoURI(suppressAuth);
        const managedClient = await setupClient(uri, role);
        return { pool: managedClient, memberId };
    } catch (err) {
        throw Error(`WeivData - Error when connecting to cached MongoClient via useClient: ${err}`);
    }
}

const encryptURI = async (uri: string) => {
    const secret = await getSecretKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
    let encrypted = cipher.update(uri, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

/**@internal */
export function getClientCache() {
    return clientCache;
}