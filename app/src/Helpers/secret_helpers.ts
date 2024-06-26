//@ts-ignore
import { secrets } from "wix-secrets-backend.v2";
//@ts-ignore
import * as wixAuth from 'wix-auth';

import NodeCache from 'node-cache';
import { logMessage } from "./log_helpers";

// Initialize a global cache instance
const cache = new NodeCache();
const getSecretValue: (secretName: string) => Promise<{ value: string }> = wixAuth.elevate(secrets.getSecretValue);

type SecretResponse<T> = T extends "URI" ? { visitor: string, member: string, admin: string } : string;

export async function getCachedSecret<URI>(secretName: string, parse?: boolean): Promise<SecretResponse<URI>> {
    try {
        if (typeof secretName !== "string") {
            throw new Error(`secretName param is not string!`);
        }

        // Try to get the secret from the cache
        let secret: any = cache.get(secretName);


        if (secret === undefined) {
            logMessage("getCachedSecret function is called and as we check the cache we found nothing so we will get secret from the Wix Secret Manager", secretName);

            // If not in cache, fetch from the API
            const { value } = await getSecretValue(secretName);

            if (parse === true) {
                // Parse the JSON safely
                let objectSecret;
                try {
                    objectSecret = JSON.parse(value);
                } catch (err) {
                    throw new Error(`failed to parse JSON for secret '${secretName}': ${err}`);
                }

                if (typeof objectSecret === 'object' && objectSecret !== null) {
                    secret = objectSecret;
                } else {
                    throw new Error(`parsed JSON is not an object for secret '${secretName}'`);
                }
            } else {
                secret = value;
            }

            // Set the secret in the cache with a specific TTL (e.g., 1 hour)
            logMessage("Secret value is saved to cache", secretName);
            cache.set(secretName, secret, 60 * 6);
        }

        logMessage("We have fetched the secret value and now returning it.", secretName);
        return secret;
    } catch (err) {
        throw new Error(`Error on general cached secret helpers: ${err}`);
    }
}

/**@internal */
export function getHelperSecretsCache() {
    return cache;
}