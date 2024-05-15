//@ts-ignore
import { secrets } from "wix-secrets-backend.v2"; //@ts-ignore
import * as wixAuth from 'wix-auth';
import NodeCache from 'node-cache';

// Initialize a global cache instance
const cache = new NodeCache();
const getSecretValue: (secretName: string) => Promise<{ value: string }> = wixAuth.elevate(secrets.getSecretValue);

type SecretResponse<T> = T extends "URI" ? { visitor: string, member: string, admin: string } : string;

export async function getCachedSecret<URI>(secretName: string, parse?: boolean): Promise<SecretResponse<URI>> {
    try {
        if (typeof secretName !== "string") {
            throw new Error(`Secret Name param is not string!`);
        }

        // Try to get the secret from the cache
        let secret: any = cache.get(secretName);

        if (secret === undefined) {
            // If not in cache, fetch from the API
            const { value } = await getSecretValue(secretName);

            if (parse === true) {
                // Parse the JSON safely
                let objectSecret;
                try {
                    objectSecret = JSON.parse(value);
                } catch (err) {
                    throw new Error(`Failed to parse JSON for secret '${secretName}': ${err}`);
                }

                if (typeof objectSecret === 'object' && objectSecret !== null) {
                    secret = objectSecret;
                } else {
                    throw new Error(`Parsed JSON is not an object for secret '${secretName}'`);
                }
            } else {
                secret = value;
            }

            // Set the secret in the cache with a specific TTL (e.g., 1 hour)
            cache.set(secretName, secret, 60 * 6);
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