//@ts-ignore
import * as weivDataConfigs from '../../../../../../../../../user-code/backend/WeivData/config';
import type { CustomOptions } from '@exweiv/weiv-data';

let savedConfigs: CustomOptions.WeivDataConfig;

export function getWeivDataConfigs(): CustomOptions.WeivDataConfig {
    try {
        const configs: undefined | (() => CustomOptions.WeivDataConfig) = weivDataConfigs["config"];

        if (configs && !savedConfigs) {
            savedConfigs = configs();
        } else if (!savedConfigs) {
            savedConfigs = {
                logs: false
            };
        }

        return savedConfigs;
    } catch (err) {
        throw new Error(`WeivData - Error while getting configs of WeivData library, ${err}`);
    }
}