"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessage = void 0;
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function logMessage(message, details) {
    try {
        const { logs } = await (0, weiv_data_config_1.getWeivDataConfigs)();
        if (logs) {
            console.log('WeivData DevLog:', message, details);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error for logger, ${err}`);
    }
}
exports.logMessage = logMessage;
