// Sync eCom Orders to MongoDB with CUD Operations
import type { Document } from "mongodb";
import { kaptanLogar } from "../Errors/error_manager";
import { insert } from "../Functions/insert";
import { native } from "../Functions/native";
import { sleep } from "./sleep";

//@ts-ignore
import wixData from 'wix-data';
import { getWeivDataConfigs } from "../Config/weiv_data_config";

export async function onMemberCreated(event: Document): Promise<void> {
    try {
        // Wait 1s before inserting (in case of data not inserted in Wix app collection yet)
        await sleep(1000);

        // Get required information
        const memberId = event.entity._id;
        const { syncDatabase } = getWeivDataConfigs();

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const { readyFullData, readyPrivateData, readyPublicData } = await getMemberData(memberId);

        // Insert to MongoDB (fire and forget)
        Promise.all([
            (await native(`${syncDatabase}/WixMembersPublicData`, true)).insertOne(readyPublicData, { retryWrites: true }),
            (await native(`${syncDatabase}/WixMembersPrivateData`, true)).insertOne(readyPrivateData, { retryWrites: true }),
            (await native(`${syncDatabase}/WixMembersFullData`, true)).insertOne(readyFullData, { retryWrites: true }),
        ]);
    } catch (err) {
        // Log Error (fire and forget)
        insert("WeivDataWixAppsSyncLogs/WixMembers", {
            message: "Member couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        // Throw Error
        kaptanLogar("00024", `Couldn't insert member when syncing: ${err}`);
    }
};

export async function onMemberUpdated(event: Document): Promise<void> {
    try {
        // Wait 1s before update (in case of data not updated in Wix app collection yet)
        await sleep(1000);

        // Get required information
        const memberId = event.entity._id;
        const { syncDatabase } = getWeivDataConfigs();

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const { readyFullData, readyPrivateData, readyPublicData } = await getMemberData(memberId);
        const find = { "entityId": { $eq: memberId } };

        // Insert to MongoDB (fire and forget)
        Promise.all([
            (await native(`${syncDatabase}/WixMembersPublicData`, true)).updateOne(find, { $set: readyPublicData }, { retryWrites: true }),
            (await native(`${syncDatabase}/WixMembersPrivateData`, true)).updateOne(find, { $set: readyPrivateData }, { retryWrites: true }),
            (await native(`${syncDatabase}/WixMembersFullData`, true)).updateOne(find, { $set: readyFullData }, { retryWrites: true }),
        ]);
    } catch (err) {
        // Log Error (fire and forget)
        insert("WeivDataWixAppsSyncLogs/WixMembers", {
            message: "Member couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        // Throw Error
        kaptanLogar("00024", `Couldn't update member when syncing: ${err}`);
    }
};

export async function onMemberDeleted(event: Document): Promise<void> {
    try {
        // Get required information
        const memberId = event.metadata.entityId;
        const { syncDatabase } = getWeivDataConfigs();

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const find = { "entityId": { $eq: memberId } };

        // Insert to MongoDB (fire and forget)
        Promise.all([
            (await native(`${syncDatabase}/WixMembersPublicData`, true)).deleteMany(find, { retryWrites: true }),
            (await native(`${syncDatabase}/WixMembersPrivateData`, true)).deleteMany(find, { retryWrites: true }),
            (await native(`${syncDatabase}/WixMembersFullData`, true)).deleteMany(find, { retryWrites: true }),
        ]);
    } catch (err) {
        // Log Error (fire and forget)
        insert("WeivDataWixAppsSyncLogs/WixMembers", {
            message: "Member couldn't deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        // Throw Error
        kaptanLogar("00024", `Couldn't update member when syncing: ${err}`);
    }
};

// HELPER FUNCTIONS
type SyncMemberData = {
    readyPublicData: Document,
    readyPrivateData: Document,
    readyFullData: Document
}

async function getMemberData(memberId: string): Promise<SyncMemberData> {
    try {
        if (!memberId) {
            kaptanLogar("00024", "Member ID is undefined when syncing WixMembers");
        }

        const [publicData, privateData, fullData] = await Promise.all([
            wixData.get("Members/PublicData", memberId, { suppressAuth: true, suppressHooks: true }),
            wixData.get("Members/PrivateMembersData", memberId, { suppressAuth: true, suppressHooks: true }),
            wixData.get("Members/FullData", memberId, { suppressAuth: true, suppressHooks: true }),
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
        }
    } catch (err) {
        kaptanLogar("00024", `Couldn't get member data when syncing: ${err}`)
    }
}