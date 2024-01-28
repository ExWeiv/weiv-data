import { getCachedSecret } from './secret_helpers';
import { Options } from 'node-cache/index'

export async function getCacheOptions(): Promise<Options> {
    try {
        const options = await getCachedSecret("WeivDataCacheOptions");

        if (options) {
            const parsed = await JSON.parse(options);
            return parsed;
        } else {
            return {
                stdTTL: 30,
                checkperiod: 5,
                useClones: true,
                deleteOnExpire: true
            }
        }
    } catch (err) {
        console.error(`WeivData - Error when getting cache options: ${err}`);
        return {
            stdTTL: 30,
            checkperiod: 5,
            useClones: true,
            deleteOnExpire: true
        }
    }
}