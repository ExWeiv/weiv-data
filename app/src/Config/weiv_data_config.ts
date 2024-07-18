//@ts-ignore
import * as weivDataConfigs from '../../../../../../../../../user-code/backend/WeivData/config';
import type { CustomOptions } from '@exweiv/weiv-data';
import { kaptanLogar } from '../Errors/error_manager';

var __weivDatasavedConfigs__: CustomOptions.WeivDataConfig = {};

export function getWeivDataConfigs(): CustomOptions.WeivDataConfig {
    try {
        const configs: undefined | (() => CustomOptions.WeivDataConfig) = weivDataConfigs["config"];

        if (configs && Object.keys(__weivDatasavedConfigs__).length === 0) {
            const userConfig = configs();
            __weivDatasavedConfigs__ = { ...__weivDatasavedConfigs__, ...userConfig };
        }

        return __weivDatasavedConfigs__;
    } catch (err) {
        kaptanLogar("00021", `while getting configs of WeivData library, ${err}`);
    }
}