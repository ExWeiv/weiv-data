"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportError = void 0;
function reportError(msg, code) {
    if (!msg) {
        console.error("Error Messagre Required!");
    }
    console.error(`${msg} - ${code}`);
    throw new Error(`${msg} - ${code}`);
}
exports.reportError = reportError;
