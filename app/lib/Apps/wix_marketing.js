"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCouponCreated = onCouponCreated;
exports.onCouponUpdated = onCouponUpdated;
exports.onCouponDeleted = onCouponDeleted;
const error_manager_1 = require("../Errors/error_manager");
const insert_1 = require("../Functions/insert");
const native_1 = require("../Functions/native");
const sleep_1 = require("./sleep");
const wix_data_1 = __importDefault(require("wix-data"));
const weiv_data_config_1 = require("../Config/weiv_data_config");
const logCollection = "WeivDataWixAppsSyncLogs/WixMarketing";
async function onCouponCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const couponId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Marketing Coupon Created - ${couponId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyCoupon = await getCouponData(couponId);
        (await (0, native_1.native)(`${syncDatabase}/WixMarketingCoupons`, true)).insertOne(readyCoupon, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Marketing coupon couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create coupon when syncing Wix Marketing: ${err}`);
    }
}
async function onCouponUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const couponId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Marketing Coupon Updated - ${couponId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: couponId } };
        const readyCoupon = await getCouponData(couponId);
        (await (0, native_1.native)(`${syncDatabase}/WixMarketingCoupons`, true)).updateOne(filter, { $set: readyCoupon }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Marketing coupon couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update coupon when syncing Wix Marketing: ${err}`);
    }
}
async function onCouponDeleted(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const couponId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Marketing Coupon Deleted - ${couponId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: couponId } };
        (await (0, native_1.native)(`${syncDatabase}/WixMarketingCoupons`, true)).deleteMany(filter, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Marketing coupon couldn't be deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't delete coupon when syncing Wix Marketing: ${err}`);
    }
}
async function getCouponData(couponId) {
    try {
        if (!couponId) {
            (0, error_manager_1.kaptanLogar)("00024", "couponId is undefined or invalid when syncing Wix Marketing");
        }
        const coupon = await wix_data_1.default.get("Marketing/Coupons", couponId, { supressAuth: true, consistentRead: true });
        const readyCoupon = { ...coupon, entityId: coupon._id };
        delete readyCoupon._id;
        return readyCoupon;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `failed to get coupon data when syncing Wix Marketing: ${err}`);
    }
}
