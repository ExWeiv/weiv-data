"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idConverter = void 0;
const item_helpers_1 = require("../Helpers/item_helpers");
function idConverter(id, stringMethod) {
    try {
        if (typeof id === "string") {
            return (0, item_helpers_1.convertStringId)(id);
        }
        else {
            return id.toString(stringMethod || "hex");
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when converting an ID: ${err}`);
    }
}
exports.idConverter = idConverter;
