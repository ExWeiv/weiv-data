"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertIdToString = convertIdToString;
exports.convertIdToObjectId = convertIdToObjectId;
const mongodb_1 = require("mongodb");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const error_manager_1 = require("../Errors/error_manager");
function convertIdToString(id, encoding) {
    try {
        return (0, internal_id_converter_1.convertToStringId)(id, encoding);
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00010", `${err}`);
    }
}
function convertIdToObjectId(id) {
    try {
        if (id instanceof mongodb_1.ObjectId) {
            return id;
        }
        else {
            return new mongodb_1.ObjectId(id);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00010", `${err}`);
    }
}
