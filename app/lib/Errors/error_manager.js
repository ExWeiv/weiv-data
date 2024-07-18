"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kaptanLogar = kaptanLogar;
const errors_1 = __importDefault(require("./errors"));
class WeivDataErrorManager extends Error {
    constructor(errCode) {
        super(errors_1.default[errCode]);
        this.message = `Code: ${errCode || "00000"} - ${errors_1.default[errCode]} (WeivData Error)`;
        this.name = "WeivDataErrorManager";
    }
}
function kaptanLogar(errCode, details) {
    const errMsg = errors_1.default[errCode];
    const error = new WeivDataErrorManager(errCode);
    const documentationLink = `https://weiv-data.apps.exweiv.com/modules/Errors.html`;
    const formattedMessage = `WeivData Error: ${errMsg}, ${details} - (Code: ${errCode}) - Error References: ${documentationLink}`;
    console.error(formattedMessage);
    throw error;
}
