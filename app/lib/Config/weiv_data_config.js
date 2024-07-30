"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConvertIdsValue = void 0;
exports.getWeivDataConfigs = getWeivDataConfigs;
const weivDataConfigs = __importStar(require("../../../../../../../../../user-code/backend/WeivData/config"));
const error_manager_1 = require("../Errors/error_manager");
const lodash_1 = require("lodash");
var __weivDatasavedConfigs__ = {
    defaultIdType: "String"
};
function getWeivDataConfigs() {
    try {
        const configs = weivDataConfigs["config"];
        if (configs && Object.keys(__weivDatasavedConfigs__).length === 0) {
            const userConfig = configs();
            __weivDatasavedConfigs__ = { ...__weivDatasavedConfigs__, ...userConfig };
        }
        return __weivDatasavedConfigs__;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00021", `while getting configs of WeivData library, ${err}`);
    }
}
const memoizedCheckIdType = (0, lodash_1.memoize)(() => {
    return getWeivDataConfigs().defaultIdType === "String" ? true : false;
});
const getConvertIdsValue = () => {
    return memoizedCheckIdType();
};
exports.getConvertIdsValue = getConvertIdsValue;
