"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerId = getOwnerId;
const wix_data_1 = __importDefault(require("wix-data"));
const wix_users_backend_1 = require("wix-users-backend");
const error_manager_1 = require("../Errors/error_manager");
async function getOwnerId(enableVisitorId = false) {
    try {
        if (wix_users_backend_1.currentUser.loggedIn) {
            return wix_users_backend_1.currentUser.id;
        }
        else if (enableVisitorId === true) {
            const { _owner, _id } = await wix_data_1.default.insert("WeivOwnerID", {}, { supressAuth: true });
            wix_data_1.default.remove("WeivOwnerID", _id, { suppressAuth: true });
            return _owner;
        }
        else {
            return null;
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00011", `${err}`);
    }
}
