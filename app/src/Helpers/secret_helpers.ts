import { secrets } from "wix-secrets-backend.v2";
import * as wixAuth from 'wix-auth';
import NodeCache from 'node-cache';

// Initialize a global cache instance
const cache = new NodeCache();
const getSecretValue: (secretName: string) => Promise<string> = wixAuth.elevate(secrets.getSecretValue);

export async function getCachedSecret(secretName: string): Promise<string | undefined> {
    try {
        // Try to get the secret from the cache
        let secret: string | undefined = cache.get(secretName);

        if (secret === undefined) {
            // If not in cache, fetch from the API
            secret = await getSecretValue(secretName);
            // Set the secret in the cache with a specific TTL (e.g., 1 hour)
            cache.set(secretName, secret, 3600);
        }

        return secret;
    } catch (err) {
        console.error(err);
        return undefined;
    }
}
