import type { Document } from "mongodb";
import { kaptanLogar } from "../Errors/error_manager";
import { insert } from "../Functions/insert";
import { native } from "../Functions/native";
import { sleep } from "./sleep";

//@ts-ignore
import wixData from 'wix-data';
import { getWeivDataConfigs } from "../Config/weiv_data_config";

const logCollection = "WeivDataWixAppsSyncLogs/WixPricingPlans";

export async function onPlanCreated(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const planId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Pricing Plans Created - ${planId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const readyPlan = await getPlanData(planId);
        (await native(`${syncDatabase}/WixPricingPlansPlans`, true)).insertOne(readyPlan, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Pricing plan couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create pricing plan when syncing Wix Pricing Plans: ${err}`);
    }
}

export async function onPlanUpdated(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const planId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Pricing Plans Updated - ${planId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const filter = { "entityId": { $eq: planId } };
        const readyPlan = await getPlanData(planId);
        (await native(`${syncDatabase}/WixPricingPlansPlans`, true)).updateOne(filter, { $set: readyPlan }, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Pricing plan couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update pricing plan when syncing Wix Pricing Plans: ${err}`);
    }
}

export async function onPlanArchived(event: Document, deletePlan?: boolean): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const planId = event.data.plan._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Pricing Plans Archived - ${planId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const filter = { "entityId": { $eq: planId } };

        if (deletePlan === true) {
            (await native(`${syncDatabase}/WixPricingPlansPlans`, true)).deleteOne(filter, { retryWrites: true });
        } else {
            const readyPlan = await getPlanData(planId);
            (await native(`${syncDatabase}/WixPricingPlansPlans`, true)).updateOne(filter, { $set: readyPlan }, { retryWrites: true });
        }
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Pricing plan couldn't be archived/deleted",
            entityId: event.data.plan._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't archive/deleted pricing plan when syncing Wix Pricing Plans: ${err}`);
    }
}

// HELPER FUNCTIONS
async function getPlanData(planId: string): Promise<Document> {
    try {
        if (!planId) {
            kaptanLogar("00024", `planId is undefined or invalid but it's required to get the plan data when syncing Wix Pricing Plans`);
        }

        const plan = await wixData.get("PaidPlans/Plans", planId, { supressAuth: true, consistentRead: true });
        const readyPlans = { ...plan, entityId: plan._id };
        delete readyPlans._id;
        return readyPlans;
    } catch (err) {
        kaptanLogar("00024", `failed to get plan data when syncing Wix Pricing Plans: ${err}`);
    }
}