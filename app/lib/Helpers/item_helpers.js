"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStringId = void 0;
const mongodb_1 = require("mongodb");
function convertStringId(_id, create = false) {
    if (typeof _id === "string") {
        return new mongodb_1.ObjectId(_id);
    }
    else if (typeof _id === "object") {
        return _id;
    }
    else {
        if (create === true) {
            return new mongodb_1.ObjectId();
        }
        throw Error(`WeivData - Wrong _id type!`);
    }
}
exports.convertStringId = convertStringId;
