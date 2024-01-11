//@ts-ignore
import { secrets } from "wix-secrets-backend.v2"; //@ts-ignore
import * as wixAuth from 'wix-auth';

const getSecretValue = wixAuth.elevate(secrets.getSecretValue);

/**
 * @description Get's the secret data (connection URI) and saves it to global variable with cache feature.
 * @param secretName Secret's name
 * @returns The secret/URI for given secret name.
 */
export async function getCachedSecret(secretName: string): Promise<string> {
    try { //@ts-ignore
        let secret = global[secretName.toUpperCase()];

        if (!secret || secret === null || secret === undefined) {
            secret = await getSecretValue(secretName); //@ts-ignore
            global[secretName.toUpperCase()] = secret;
        }

        return secret;
    } catch (err) {
        console.error("Error on getting cached secret", err);
        const visitorURI = await getSecretValue("visitorURI");
        return visitorURI;
    }
}