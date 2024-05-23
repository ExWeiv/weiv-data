//@ts-ignore
import * as weivDataConfigs from '../../../../../../../../../user-code/backend/WeivData/config';
import type { CustomOptions } from '@exweiv/weiv-data';

let savedConfigs: CustomOptions.WeivDataConfig;

export async function getWeivDataConfigs(): Promise<CustomOptions.WeivDataConfig> {
    try {
        const configs: undefined | (() => CustomOptions.WeivDataConfig | Promise<CustomOptions.WeivDataConfig>) = weivDataConfigs["config"];

        if (configs && !savedConfigs) {
            savedConfigs = await configs();
        } else {
            savedConfigs = {
                logs: false
            }
        }

        return savedConfigs;
    } catch (err) {
        throw new Error(`WeivData - Error while getting configs of WeivData library, ${err}`);
    }
}