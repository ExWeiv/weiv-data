"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerId = void 0;
//@ts-ignore
const wix_data_1 = __importDefault(require("wix-data")); //@ts-ignore
const wix_users_backend_1 = require("wix-users-backend");
async function getOwnerId(enableVisitorId = false) {
    try {
        if (wix_users_backend_1.currentUser.loggedIn) {
            return wix_users_backend_1.currentUser.id;
        }
        else if (enableVisitorId === true) {
            // If member not logged-in create temp data and get the visitor_id from _owner field of created item.
            const { _owner, _id } = await wix_data_1.default.insert("WeivOwnerID", {});
            wix_data_1.default.remove("WeivOwnerID", _id, { suppressAuth: true });
            return _owner;
        }
        else {
            return null;
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when checking user id: (Possible Velo API BUG) ${err}`);
    }
}
exports.getOwnerId = getOwnerId;
