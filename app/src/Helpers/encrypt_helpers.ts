//@ts-ignore
import { secrets } from 'wix-secrets-backend.v2';
import { getCachedSecret } from './secret_helpers';
import crypto from 'crypto';
import { kaptanLogar } from '../Errors/error_manager';

/**@internal */
export async function getSecretKey(): Promise<string> {
    try {
        const cachedSecret: string = await getCachedSecret("WeivDataURIEncryptSecret");
        if (cachedSecret) {
            return cachedSecret;
        } else {
            return await createRandomSecret();
        }
    } catch (err) {
        return await createRandomSecret();
    }
}

async function createRandomSecret(): Promise<string> {
    try {
        const secret = {
            name: "WeivDataURIEncryptSecret",
            value: crypto.randomBytes(32).toString('hex'),
            description: "This is a secret key that's used when we are storing uris in cache to keep them secure. If you delete it system will create new one. Do not delete it!"
        }

        await secrets.createSecret(secret);
        return secret.value;
    } catch (err) {
        kaptanLogar("00009", `when creating or getting URI secret key for (WeivDataURIEncryptSecret): ${err}`)
    }
}