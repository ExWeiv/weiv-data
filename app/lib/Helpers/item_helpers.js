"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertObjectId = exports.convertStringId = void 0;
const mongodb_1 = require("mongodb");
function convertStringId(_id, create = false) {
    if (!_id) {
        throw new Error(`_id doesn't exist and it's undefined!`);
    }
    else {
        if (typeof _id !== "string" && typeof _id !== "object") {
            throw new Error(`Invalid _id value type!, it must be a string or ObjectId`);
        }
    }
    if (mongodb_1.ObjectId.isValid(_id)) {
        if (typeof _id === "string") {
            return new mongodb_1.ObjectId(_id);
        }
        else if (typeof _id === "object") {
            return _id;
        }
        else {
            throw new Error(`Invalid ObjectID (converted from string or ObjectId but it's still invalid)`);
        }
    }
    else {
        if (create === true) {
            return new mongodb_1.ObjectId();
        }
        throw new Error(`Invalid _id type for convertStringId method, itemIds should be string or ObjectId!`);
    }
}
exports.convertStringId = convertStringId;
function convertObjectId(_id) {
    if (_id) {
        if (typeof _id === "string") {
            return _id;
        }
        return _id.toHexString();
    }
    else {
        throw new Error(`WeivData - ObjectId -> String converter not working!`);
    }
}
exports.convertObjectId = convertObjectId;
