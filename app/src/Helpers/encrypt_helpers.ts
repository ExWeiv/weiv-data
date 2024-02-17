import crypto from 'crypto'; //@ts-ignore
import { secrets } from 'wix-secrets-backend.v2';
import { getCachedSecret } from './secret_helpers';

/**@internal */
export async function getSecretKey(): Promise<string> {
    try {
        const secret = {
            name: "WeivDataURIEncryptSecret",
            value: crypto.randomBytes(32).toString('hex'),
            description: "This is a secret key that's used when we are storing uris in cache to keep them secure. If you delete it system will create new one. Do not delete it!"
        }

        const cachedSecret = await getCachedSecret("WeivDataURIEncryptSecret");

        if (cachedSecret) {
            return cachedSecret;
        } else {
            await secrets.createSecret(secret);
            return secret.value;
        }
    } catch (err) {
        throw Error(`WeivData - Error when creating or getting URI secret key: ${err}`);
    }
}