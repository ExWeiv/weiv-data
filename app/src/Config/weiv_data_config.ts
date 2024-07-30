//@ts-ignore
import * as weivDataConfigs from '../../../../../../../../../user-code/backend/WeivData/config';
import type { CustomOptions } from '@exweiv/weiv-data';
import { kaptanLogar } from '../Errors/error_manager';
import { memoize } from 'lodash';

var __weivDatasavedConfigs__: CustomOptions.WeivDataConfig = {
    defaultIdType: "String",
    defaultDatabaseName: "ExWeiv"
};

const memoizedConfig = memoize(() => {
    const configs: undefined | (() => CustomOptions.WeivDataConfig) = weivDataConfigs["config"];

    if (configs && Object.keys(__weivDatasavedConfigs__).length === 0) {
        const userConfig = configs();
        __weivDatasavedConfigs__ = { ...__weivDatasavedConfigs__, ...userConfig };
    }

    return __weivDatasavedConfigs__;
});

export function getWeivDataConfigs(): CustomOptions.WeivDataConfig {
    try {
        return memoizedConfig();
    } catch (err) {
        kaptanLogar("00021", `while getting configs of WeivData library, ${err}`);
    }
}

const memoizedCheckIdType = memoize(() => {
    return getWeivDataConfigs().defaultIdType === "String" ? true : false;
});

export const getConvertIdsValue = () => {
    return memoizedCheckIdType();
};