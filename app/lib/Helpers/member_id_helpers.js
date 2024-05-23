"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerId = void 0;
const wix_data_1 = __importDefault(require("wix-data"));
const wix_users_backend_1 = require("wix-users-backend");
const log_helpers_1 = require("./log_helpers");
async function getOwnerId(enableVisitorId = false) {
    try {
        (0, log_helpers_1.logMessage)(`getOwnerId function is called so now we will try to find or get the current user's ID, enableVisitorId = ${enableVisitorId}`);
        if (wix_users_backend_1.currentUser.loggedIn) {
            (0, log_helpers_1.logMessage)(`User is alreaddy logged-in so we get the memberId: ${wix_users_backend_1.currentUser.id}`);
            return wix_users_backend_1.currentUser.id;
        }
        else if (enableVisitorId === true) {
            (0, log_helpers_1.logMessage)(`User is not logged-in but enableVisitorId = ${enableVisitorId} (should be true) and now we will try to find the visitor id via WixData`);
            const { _owner, _id } = await wix_data_1.default.insert("WeivOwnerID", {}, { supressAuth: true });
            wix_data_1.default.remove("WeivOwnerID", _id, { suppressAuth: true });
            (0, log_helpers_1.logMessage)(`We have created a new item in WeivOwnerID collection which lives in WixData to get visitor id and this is what we found: ${_owner}, (same item is also deleted after created)`);
            return _owner;
        }
        else {
            (0, log_helpers_1.logMessage)(`Current user is not logged-in and enableVisitorId = ${enableVisitorId} (should be false) so we will return null`);
            return null;
        }
    }
    catch (err) {
        throw new Error(`Error when checking user id: (Possible Velo API BUG) ${err}`);
    }
}
exports.getOwnerId = getOwnerId;
