"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStringId = void 0;
const mongodb_1 = require("mongodb");
function convertStringId(_id) {
    if (typeof _id === "string") {
        return new mongodb_1.ObjectId(_id);
    }
    else {
        return _id;
    }
}
exports.convertStringId = convertStringId;
