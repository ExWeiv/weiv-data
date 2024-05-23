"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessage = void 0;
const weiv_data_config_1 = require("../Config/weiv_data_config");
function logMessage(message, details) {
    try {
        const { logs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (logs) {
            console.log('WeivData DevLog:', message, details);
        }
        return;
    }
    catch (err) {
        console.error('WeivData - Error for logger:', err);
        return;
    }
}
exports.logMessage = logMessage;
