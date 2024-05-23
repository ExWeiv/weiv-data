//@ts-ignore
import { secrets } from 'wix-secrets-backend.v2';

import crypto from 'crypto';
import { getCachedSecret } from './secret_helpers';
import { logMessage } from './log_helpers';

/**@internal */
export async function getSecretKey(): Promise<string> {
    try {
        await logMessage(`getSecretKey is called and now we will get the secret key to encrypt or decrypt connection URIs when saving them to cache for better security`);
        const cachedSecret: string = await getCachedSecret("WeivDataURIEncryptSecret");
        if (cachedSecret) {
            return cachedSecret;
        } else {
            const secret = {
                name: "WeivDataURIEncryptSecret",
                value: crypto.randomBytes(32).toString('hex'),
                description: "This is a secret key that's used when we are storing uris in cache to keep them secure. If you delete it system will create new one. Do not delete it!"
            }

            await secrets.createSecret(secret);
            return secret.value;
        }
    } catch (err) {
        throw new Error(`Error when creating or getting URI secret key: ${err}`);
    }
}