"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idConvreter = void 0;
const item_helpers_1 = require("../Helpers/item_helpers");
function idConvreter(id, stringMethod) {
    if (typeof id === "string") {
        return (0, item_helpers_1.convertStringId)(id);
    }
    else {
        return id.toString(stringMethod || "hex");
    }
}
exports.idConvreter = idConvreter;
