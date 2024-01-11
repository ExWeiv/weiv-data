"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberURI = void 0;
const wix_members_backend_1 = require("wix-members-backend");
const secret_helpers_1 = require("./secret_helpers");
async function getMemberURI(suppressAuth = false) {
    try {
        if (suppressAuth != true) {
            const { title } = await wix_members_backend_1.currentMember.getRoles()[0];
            if (title === "Admin") {
                const { value } = await (0, secret_helpers_1.getCachedSecret)("AdminURI");
                return { uri: value };
            }
            else {
                const { _id } = await wix_members_backend_1.currentMember.getMember();
                const { value } = await (0, secret_helpers_1.getCachedSecret)("MemberURI");
                return { memberId: _id, uri: value };
            }
        }
        else {
            const { value } = await (0, secret_helpers_1.getCachedSecret)("AdminURI");
            return { uri: value };
        }
        ;
    }
    catch (err) {
        console.error("Error on getting URI for MongoDB", err);
        const { value } = await (0, secret_helpers_1.getCachedSecret)("VisitorURI");
        return { uri: value };
    }
}
exports.getMemberURI = getMemberURI;
