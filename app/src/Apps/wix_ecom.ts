import type { Document } from "mongodb";
import { kaptanLogar } from "../Errors/error_manager";
import { insert } from "../Functions/insert";
import { native } from "../Functions/native";
import { sleep } from "./sleep";

//@ts-ignore
import { orders } from 'wix-ecom-backend'; //@ts-ignore
import { elevate } from "wix-auth"; //@ts-ignore
import wixData from 'wix-data';
import { getWeivDataConfigs } from "../Config/weiv_data_config";

const logCollection = "WeivDataWixAppsSyncLogs/WixeCom";

export async function onOrderCreated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00025");
        }

        await sleep(1000);

        // Get required information
        const orderId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix eCom Order Created - ${orderId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00026");
        }

        const readyOrder = await getOrderData(orderId);
        (await native(`${syncDatabase}/WixeComOrders`, true)).insertOne(readyOrder, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "eCommerce order couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create order when syncing Wix eCom: ${err}`);
    }
}

export async function onOrderUpdated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00025");
        }

        await sleep(1000);

        // Get required information
        const orderId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix eCom Order Updated - ${orderId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00026");
        }

        const readyOrder = await getOrderData(orderId);
        const filter = { "entityId": { $eq: orderId } };
        (await native(`${syncDatabase}/WixeComOrders`, true)).updateOne(filter, { $set: readyOrder }, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "eCommerce order couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update order when syncing Wix eCom: ${err}`);
    }
}

// ABANDONED CHECKOUTS
export async function onAbandonedCheckoutCreated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00025");
        }

        // Get required information
        const abandonedCheckoutId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix eCom Abandoned Checkout Created - ${abandonedCheckoutId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00026");
        }

        const readyAbandonedCheckout = { ...event.entity, entityId: abandonedCheckoutId };
        delete readyAbandonedCheckout._id;

        (await native(`${syncDatabase}/WixeComAbandonedCheckouts`, true)).insertOne(readyAbandonedCheckout, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "eCommerce abandoned checkout couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create abandoned checkout when syncing Wix eCom: ${err}`);
    }
}

export async function onAbandonedCheckoutRecovered(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00025");
        }

        // Get required information
        const abandonedCheckoutId = event.data.abandonedCheckout._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix eCom Abandoned Checkout Updated/Recovered - ${abandonedCheckoutId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00026");
        }

        const filter = { "entityId": { $eq: abandonedCheckoutId } };
        const readyAbandonedCheckout = { ...event.data.abandonedCheckout, entityId: abandonedCheckoutId };
        delete readyAbandonedCheckout._id;

        (await native(`${syncDatabase}/WixeComAbandonedCheckouts`, true)).updateOne(filter, { $set: readyAbandonedCheckout }, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "eCommerce abandoned checkout couldn't be updated",
            entityId: event.data.abandonedCheckout._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update abandoned checkout when syncing Wix eCom: ${err}`);
    }
}

// HELPER FUNCTIONS
export async function getOrderData(orderId: string): Promise<Document> {
    try {
        if (!orderId) {
            kaptanLogar("00024", "orderId is required but it's undefined");
        }

        const elevatedGetOrder = elevate(orders.getOrder);
        const order = await elevatedGetOrder(orderId);
        const readyOrder = { ...order, entityId: order._id };
        delete readyOrder._id;
        return readyOrder;
    } catch (err) {
        kaptanLogar("00024", `failed to get the order data when syncing Wix eCom: ${err}`);
    }
}