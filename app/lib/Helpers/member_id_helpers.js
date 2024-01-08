"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerId = void 0;
const wix_data_1 = __importDefault(require("wix-data"));
const wix_members_backend_1 = require("wix-members-backend");
const wix_users_backend_1 = require("wix-users-backend");
async function getOwnerId() {
    if (wix_users_backend_1.currentUser.loggedIn) {
        const { _id } = await wix_members_backend_1.currentMember.getMember({ fieldsets: ['PUBLIC'] });
        return _id;
    }
    else {
        const { _owner } = await wix_data_1.default.insert("WeivOwnerID", {});
        return _owner;
    }
}
exports.getOwnerId = getOwnerId;
