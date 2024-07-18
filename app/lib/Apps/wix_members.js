"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMemberCreated = onMemberCreated;
exports.onMemberUpdated = onMemberUpdated;
exports.onMemberDeleted = onMemberDeleted;
const error_manager_1 = require("../Errors/error_manager");
const insert_1 = require("../Functions/insert");
const native_1 = require("../Functions/native");
const sleep_1 = require("./sleep");
const wix_data_1 = __importDefault(require("wix-data"));
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function onMemberCreated(event) {
    try {
        await (0, sleep_1.sleep)(1000);
        const memberId = event.entity._id;
        const { syncDatabase } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00024", "You didn't configure any database name to sync Wix apps data!");
        }
        const { readyFullData, readyPrivateData, readyPublicData } = await getMemberData(memberId);
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPublicData`, true)).insertOne(readyPublicData, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPrivateData`, true)).insertOne(readyPrivateData, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersFullData`, true)).insertOne(readyFullData, { retryWrites: true }),
        ]);
    }
    catch (err) {
        (0, insert_1.insert)("WeivDataWixAppsSyncLogs/WixMembers", {
            message: "Member couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't insert member when syncing: ${err}`);
    }
}
;
async function onMemberUpdated(event) {
    try {
        await (0, sleep_1.sleep)(1000);
        const memberId = event.entity._id;
        const { syncDatabase } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00024", "You didn't configure any database name to sync Wix apps data!");
        }
        const { readyFullData, readyPrivateData, readyPublicData } = await getMemberData(memberId);
        const find = { "entityId": memberId };
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPublicData`, true)).updateOne(find, readyPublicData, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPrivateData`, true)).updateOne(find, readyPrivateData, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersFullData`, true)).updateOne(find, readyFullData, { retryWrites: true }),
        ]);
    }
    catch (err) {
        (0, insert_1.insert)("WeivDataWixAppsSyncLogs/WixMembers", {
            message: "Member couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update member when syncing: ${err}`);
    }
}
;
async function onMemberDeleted(event) {
    try {
        const memberId = event.metadata.entityId;
        const { syncDatabase } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00024", "You didn't configure any database name to sync Wix apps data!");
        }
        const find = { "entityId": memberId };
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPublicData`, true)).deleteMany(find, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPrivateData`, true)).deleteMany(find, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersFullData`, true)).deleteMany(find, { retryWrites: true }),
        ]);
    }
    catch (err) {
        (0, insert_1.insert)("WeivDataWixAppsSyncLogs/WixMembers", {
            message: "Member couldn't deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update member when syncing: ${err}`);
    }
}
;
async function getMemberData(memberId) {
    try {
        if (!memberId) {
            (0, error_manager_1.kaptanLogar)("00024", "Member ID is undefined when syncing WixMembers");
        }
        const [publicData, privateData, fullData] = await Promise.all([
            wix_data_1.default.get("Members/PublicData", memberId, { suppressAuth: true, suppressHooks: true }),
            wix_data_1.default.get("Members/PrivateMembersData", memberId, { suppressAuth: true, suppressHooks: true }),
            wix_data_1.default.get("Members/FullData", memberId, { suppressAuth: true, suppressHooks: true }),
        ]);
        const readyPublicData = { ...publicData, entityId: publicData._id };
        delete readyPublicData._id;
        const readyPrivateData = { ...privateData, entityId: privateData._id, };
        delete readyPrivateData._id;
        const readyFullData = { ...fullData, entityId: fullData._id, };
        delete readyFullData._id;
        return {
            readyPublicData,
            readyPrivateData,
            readyFullData
        };
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't get member data when syncing: ${err}`);
    }
}
