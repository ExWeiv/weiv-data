"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheOptions = void 0;
const secret_helpers_1 = require("./secret_helpers");
async function getCacheOptions() {
    try {
        const options = await (0, secret_helpers_1.getCachedSecret)("WeivDataCacheOptions");
        if (options) {
            const parsed = await JSON.parse(options);
            return parsed;
        }
        else {
            return {
                stdTTL: 30,
                checkperiod: 5,
                useClones: true,
                deleteOnExpire: true
            };
        }
    }
    catch (err) {
        console.error(`WeivData - Error when getting cache options: ${err}`);
        return {
            stdTTL: 30,
            checkperiod: 5,
            useClones: true,
            deleteOnExpire: true
        };
    }
}
exports.getCacheOptions = getCacheOptions;
