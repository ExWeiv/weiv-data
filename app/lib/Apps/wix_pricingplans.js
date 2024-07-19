"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPlanCreated = onPlanCreated;
exports.onPlanUpdated = onPlanUpdated;
exports.onPlanArchived = onPlanArchived;
const error_manager_1 = require("../Errors/error_manager");
const insert_1 = require("../Functions/insert");
const native_1 = require("../Functions/native");
const sleep_1 = require("./sleep");
const wix_data_1 = __importDefault(require("wix-data"));
const weiv_data_config_1 = require("../Config/weiv_data_config");
const logCollection = "WeivDataWixAppsSyncLogs/WixPricingPlans";
async function onPlanCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const planId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Pricing Plans Created - ${planId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyPlan = await getPlanData(planId);
        (await (0, native_1.native)(`${syncDatabase}/WixPricingPlansPlans`, true)).insertOne(readyPlan, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Pricing plan couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create pricing plan when syncing Wix Pricing Plans: ${err}`);
    }
}
async function onPlanUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const planId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Pricing Plans Updated - ${planId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: planId } };
        const readyPlan = await getPlanData(planId);
        (await (0, native_1.native)(`${syncDatabase}/WixPricingPlansPlans`, true)).updateOne(filter, { $set: readyPlan }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Pricing plan couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update pricing plan when syncing Wix Pricing Plans: ${err}`);
    }
}
async function onPlanArchived(event, deletePlan) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const planId = event.data.plan._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Pricing Plans Archived - ${planId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: planId } };
        if (deletePlan === true) {
            (await (0, native_1.native)(`${syncDatabase}/WixPricingPlansPlans`, true)).deleteOne(filter, { retryWrites: true });
        }
        else {
            const readyPlan = await getPlanData(planId);
            (await (0, native_1.native)(`${syncDatabase}/WixPricingPlansPlans`, true)).updateOne(filter, { $set: readyPlan }, { retryWrites: true });
        }
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Pricing plan couldn't be archived/deleted",
            entityId: event.data.plan._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't archive/deleted pricing plan when syncing Wix Pricing Plans: ${err}`);
    }
}
async function getPlanData(planId) {
    try {
        if (!planId) {
            (0, error_manager_1.kaptanLogar)("00024", `planId is undefined or invalid but it's required to get the plan data when syncing Wix Pricing Plans`);
        }
        const plan = await wix_data_1.default.get("PaidPlans/Plans", planId, { supressAuth: true, consistentRead: true });
        const readyPlans = { ...plan, entityId: plan._id };
        delete readyPlans._id;
        return readyPlans;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `failed to get plan data when syncing Wix Pricing Plans: ${err}`);
    }
}
