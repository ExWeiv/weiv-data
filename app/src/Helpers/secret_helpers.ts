//@ts-ignore
import { secrets } from "wix-secrets-backend.v2"; //@ts-ignore
import * as wixAuth from 'wix-auth';
import NodeCache from 'node-cache';

// Initialize a global cache instance
const cache = new NodeCache();
const getSecretValue: (secretName: string) => Promise<{ value: string }> = wixAuth.elevate(secrets.getSecretValue);

export async function getCachedSecret(secretName: string): Promise<string | undefined> {
    try {
        // Try to get the secret from the cache
        let secret: string | undefined = cache.get(secretName);

        if (secret === undefined) {
            // If not in cache, fetch from the API
            const { value } = await getSecretValue(secretName);
            // Set the secret in the cache with a specific TTL (e.g., 1 hour)
            secret = value;
            cache.set(secretName, value, 60 * 10);
        }

        return secret;
    } catch (err) {
        console.warn(`WeivData - Error on general cached secret helpers: ${err}`);
        return undefined;
    }
}

/**@internal */
export function getHelperSecretsCache() {
    return cache;
}