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
            await logMessage(`getCachedSecret function is called and as we check the cache we found nothing so we will get secret from the Wix Secret Manager`, secret);
            // If not in cache, fetch from the API
            const { value } = await getSecretValue(secretName);

            await logMessage(`We got the secret value from secret manager here it's first 3 char: ${value.slice(0, 3)}`);

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

            await logMessage(`We are now saving found secret into cache so we don't need to get it from secret manager again and again`);
            // Set the secret in the cache with a specific TTL (e.g., 1 hour)
            cache.set(secretName, secret, 60 * 6);
        }

        return secret;
    } catch (err) {
        throw new Error(`Error on general cached secret helpers: ${err}`);
    }
}

/**@internal */
export function getHelperSecretsCache() {
    logMessage(`getHelperSecretsCache function is called and now we are returning secret cache`);
    return cache;
}