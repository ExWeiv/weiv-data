"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberURI = void 0;
const wix_members_backend_1 = require("wix-members-backend");
const secret_helpers_1 = require("./secret_helpers");
async function getMemberURI(suppressAuth = false) {
    try {
        if (suppressAuth != true) {
            const { title } = await wix_members_backend_1.currentMember.getRole();
            if (title === "Admin") {
                const uri = await (0, secret_helpers_1.getCachedSecret)("AdminURI");
                return { uri };
            }
            else {
                const { _id } = await wix_members_backend_1.currentMember.getMember();
                const uri = await (0, secret_helpers_1.getCachedSecret)("MemberURI");
                return { memberId: _id, uri };
            }
        }
        else {
            const uri = await (0, secret_helpers_1.getCachedSecret)("AdminURI");
            return { uri };
        }
        ;
    }
    catch (err) {
        const uri = await (0, secret_helpers_1.getCachedSecret)("VisitorURI");
        return { uri };
    }
}
exports.getMemberURI = getMemberURI;
