//@ts-ignore
import { secrets } from "wix-secrets-backend.v2"; //@ts-ignore
import * as wixAuth from 'wix-auth';
import NodeCache from 'node-cache';

// Initialize a global cache instance
const cache = new NodeCache();
const getSecretValue: (secretName: string) => Promise<{ value: string }> = wixAuth.elevate(secrets.getSecretValue);

type SecretResponse<T> = T extends "URI" ? { visitor: string, member: string, admin: string } : string;

/**
 * 
 * @param secretName Secret name in Wix's secret manager
 * @param parse Enable JSON parsing or not (defaults to false)
 * @returns {string | object | undefined}
 * 
 * @internal
 */
export async function getCachedSecret<URI>(secretName: string, parse?: boolean): Promise<SecretResponse<URI>> {
    try {
        // Try to get the secret from the cache
        let secret: any = cache.get(secretName);

        if (secret === undefined) {
            // If not in cache, fetch from the API
            const { value } = await getSecretValue(secretName);

            if (parse === true) {
                const objectSecret: object = await JSON.parse(value);
                secret = objectSecret;
            } else {
                secret = value;
            }

            // Set the secret in the cache with a specific TTL (e.g., 1 hour)
            cache.set(secretName, value, 60 * 10);
        }

        return secret;
    } catch (err) {
        throw Error(`WeivData - Error on general cached secret helpers: ${err}`);
    }
}

/**@internal */
export function getHelperSecretsCache() {
    return cache;
}