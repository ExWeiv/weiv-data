import { secrets } from "wix-secrets-backend.v2";
import * as wixAuth from 'wix-auth';
import NodeCache from 'node-cache';

// Initialize a global cache instance
const cache = new NodeCache();
const getSecretValue: (secretName: string) => Promise<{ value: string }> = wixAuth.elevate(secrets.getSecretValue);

/**
 * @description Get's the secret data (connection URI) and caches it using node-cache.
 * @param secretName Secret's name
 * @returns The secret/URI for the given secret name.
 */
export async function getCachedSecret(secretName: string): Promise<string> {
    try { 
        let secret: string | undefined = cache.get(secretName);

        if (secret === undefined) {
            const { value } = await getSecretValue(secretName);
            secret = value.toString();
            cache.set(secretName, value.toString(), 3600);
        }

        return secret;
    } catch (err) {
        throw Error(`Error on getting cached secret for URIs: ${err}`);
    }
}
