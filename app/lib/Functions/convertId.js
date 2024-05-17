"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertId = void 0;
const item_helpers_1 = require("../Helpers/item_helpers");
function convertId(id, stringMethod) {
    try {
        if (typeof id === "string") {
            return (0, item_helpers_1.convertStringId)(id);
        }
        else {
            return id.toString(stringMethod || "hex");
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when converting an ID: ${err}`);
    }
}
exports.convertId = convertId;
