"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMemberCreated = onMemberCreated;
exports.onMemberUpdated = onMemberUpdated;
exports.onMemberDeleted = onMemberDeleted;
exports.onBadgeCreated = onBadgeCreated;
exports.onBadgeUpdated = onBadgeUpdated;
exports.onBadgeDeleted = onBadgeDeleted;
const error_manager_1 = require("../Errors/error_manager");
const insert_1 = require("../Functions/insert");
const native_1 = require("../Functions/native");
const sleep_1 = require("./sleep");
const wix_data_1 = __importDefault(require("wix-data"));
const weiv_data_config_1 = require("../Config/weiv_data_config");
const logCollection = "WeivDataWixAppsSyncLogs/WixMembers";
async function onMemberCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const memberId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Members Created - ${memberId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const { readyFullData, readyPrivateData, readyPublicData } = await getMemberData(memberId);
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPublicData`, true)).insertOne(readyPublicData, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPrivateData`, true)).insertOne(readyPrivateData, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersFullData`, true)).insertOne(readyFullData, { retryWrites: true }),
        ]);
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
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
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const memberId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Members Updated - ${memberId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const { readyFullData, readyPrivateData, readyPublicData } = await getMemberData(memberId);
        const find = { "entityId": { $eq: memberId } };
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPublicData`, true)).updateOne(find, { $set: readyPublicData }, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPrivateData`, true)).updateOne(find, { $set: readyPrivateData }, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersFullData`, true)).updateOne(find, { $set: readyFullData }, { retryWrites: true }),
        ]);
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
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
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const memberId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Members Deleted - ${memberId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const find = { "entityId": { $eq: memberId } };
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPublicData`, true)).deleteMany(find, { ordered: false, retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersPrivateData`, true)).deleteMany(find, { ordered: false, retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixMembersFullData`, true)).deleteMany(find, { ordered: false, retryWrites: true }),
        ]);
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Member couldn't deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update member when syncing: ${err}`);
    }
}
;
async function onBadgeCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const badgeId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Members Badge Created - ${badgeId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyBadgeData = await getBadgeData(badgeId);
        (await (0, native_1.native)(`${syncDatabase}/WixMembersBadges`, true)).insertOne(readyBadgeData, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Member badge couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create badge when syncing: ${err}`);
    }
}
async function onBadgeUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const badgeId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Members Badge Updated - ${badgeId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyBadgeData = await getBadgeData(badgeId);
        const find = { "entityId": { $eq: badgeId } };
        (await (0, native_1.native)(`${syncDatabase}/WixMembersBadges`, true)).updateOne(find, { $set: readyBadgeData }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Member badge couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update badge when syncing: ${err}`);
    }
}
async function onBadgeDeleted(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const badgeId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Members Badge Deleted - ${badgeId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const find = { "entityId": { $eq: badgeId } };
        (await (0, native_1.native)(`${syncDatabase}/WixMembersBadges`, true)).deleteMany(find, { ordered: false, retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Member badge couldn't deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't delete badge when syncing: ${err}`);
    }
}
async function getMemberData(memberId) {
    try {
        if (!memberId) {
            (0, error_manager_1.kaptanLogar)("00024", "Member ID is undefined when syncing WixMembers");
        }
        const [publicData, privateData, fullData] = await Promise.all([
            wix_data_1.default.get("Members/PublicData", memberId, { suppressAuth: true, suppressHooks: true, consistentRead: true }),
            wix_data_1.default.get("Members/PrivateMembersData", memberId, { suppressAuth: true, suppressHooks: true, consistentRead: true }),
            wix_data_1.default.get("Members/FullData", memberId, { suppressAuth: true, suppressHooks: true, consistentRead: true }),
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
async function getBadgeData(badgeId) {
    try {
        if (!badgeId) {
            (0, error_manager_1.kaptanLogar)("00024", "Badge ID is undefined when syncing Wix Members Badges");
        }
        const badgeData = await wix_data_1.default.get("Members/Badges", badgeId, { suppressAuth: true, consistentRead: true });
        const readyBadgeData = { ...badgeData, entityId: badgeData._id };
        delete readyBadgeData._id;
        return readyBadgeData;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't get badge data when syncing: ${err}`);
    }
}
