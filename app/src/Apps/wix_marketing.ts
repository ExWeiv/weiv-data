import type { Document } from "mongodb";
import { kaptanLogar } from "../Errors/error_manager";
import { insert } from "../Functions/insert";
import { native } from "../Functions/native";
import { sleep } from "./sleep";

//@ts-ignore
import wixData from 'wix-data';
import { getWeivDataConfigs } from "../Config/weiv_data_config";

const logCollection = "WeivDataWixAppsSyncLogs/WixMarketing";

export async function onCouponCreated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00025");
        }

        await sleep(1000);

        // Get required information
        const couponId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Marketing Coupon Created - ${couponId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00026");
        }

        const readyCoupon = await getCouponData(couponId);
        (await native(`${syncDatabase}/WixMarketingCoupons`, true)).insertOne(readyCoupon, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Marketing coupon couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create coupon when syncing Wix Marketing: ${err}`);
    }
}

export async function onCouponUpdated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00025");
        }

        await sleep(1000);

        // Get required information
        const couponId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Marketing Coupon Updated - ${couponId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00026");
        }

        const filter = { "entityId": { $eq: couponId } };
        const readyCoupon = await getCouponData(couponId);
        (await native(`${syncDatabase}/WixMarketingCoupons`, true)).updateOne(filter, { $set: readyCoupon }, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Marketing coupon couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update coupon when syncing Wix Marketing: ${err}`);
    }
}

export async function onCouponDeleted(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00025");
        }

        // Get required information
        const couponId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Marketing Coupon Deleted - ${couponId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00026");
        }

        const filter = { "entityId": { $eq: couponId } };
        (await native(`${syncDatabase}/WixMarketingCoupons`, true)).deleteMany(filter, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Marketing coupon couldn't be deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't delete coupon when syncing Wix Marketing: ${err}`);
    }
}

// HELPER FUNCTIONS
async function getCouponData(couponId: string): Promise<Document> {
    try {
        if (!couponId) {
            kaptanLogar("00024", "couponId is undefined or invalid when syncing Wix Marketing");
        }

        const coupon = await wixData.get("Marketing/Coupons", couponId, { supressAuth: true, consistentRead: true });
        const readyCoupon = { ...coupon, entityId: coupon._id };
        delete readyCoupon._id;
        return readyCoupon;
    } catch (err) {
        kaptanLogar("00024", `failed to get coupon data when syncing Wix Marketing: ${err}`);
    }
}