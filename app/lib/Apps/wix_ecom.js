"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOrderCreated = onOrderCreated;
exports.onOrderUpdated = onOrderUpdated;
exports.onAbandonedCheckoutCreated = onAbandonedCheckoutCreated;
exports.onAbandonedCheckoutRecovered = onAbandonedCheckoutRecovered;
exports.getOrderData = getOrderData;
const error_manager_1 = require("../Errors/error_manager");
const insert_1 = require("../Functions/insert");
const native_1 = require("../Functions/native");
const sleep_1 = require("./sleep");
const wix_ecom_backend_1 = require("wix-ecom-backend");
const wix_auth_1 = require("wix-auth");
const weiv_data_config_1 = require("../Config/weiv_data_config");
const logCollection = "WeivDataWixAppsSyncLogs/WixeCom";
async function onOrderCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const orderId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix eCom Order Created - ${orderId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyOrder = await getOrderData(orderId);
        (await (0, native_1.native)(`${syncDatabase}/WixeComOrders`, true)).insertOne(readyOrder, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "eCommerce order couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create order when syncing Wix eCom: ${err}`);
    }
}
async function onOrderUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const orderId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix eCom Order Updated - ${orderId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyOrder = await getOrderData(orderId);
        const filter = { "entityId": { $eq: orderId } };
        (await (0, native_1.native)(`${syncDatabase}/WixeComOrders`, true)).updateOne(filter, { $set: readyOrder }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "eCommerce order couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update order when syncing Wix eCom: ${err}`);
    }
}
async function onAbandonedCheckoutCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const abandonedCheckoutId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix eCom Abandoned Checkout Created - ${abandonedCheckoutId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyAbandonedCheckout = { ...event.entity, entityId: abandonedCheckoutId };
        delete readyAbandonedCheckout._id;
        (await (0, native_1.native)(`${syncDatabase}/WixeComAbandonedCheckouts`, true)).insertOne(readyAbandonedCheckout, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "eCommerce abandoned checkout couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create abandoned checkout when syncing Wix eCom: ${err}`);
    }
}
async function onAbandonedCheckoutRecovered(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const abandonedCheckoutId = event.data.abandonedCheckout._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix eCom Abandoned Checkout Updated/Recovered - ${abandonedCheckoutId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: abandonedCheckoutId } };
        const readyAbandonedCheckout = { ...event.data.abandonedCheckout, entityId: abandonedCheckoutId };
        delete readyAbandonedCheckout._id;
        (await (0, native_1.native)(`${syncDatabase}/WixeComAbandonedCheckouts`, true)).updateOne(filter, { $set: readyAbandonedCheckout }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "eCommerce abandoned checkout couldn't be updated",
            entityId: event.data.abandonedCheckout._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update abandoned checkout when syncing Wix eCom: ${err}`);
    }
}
async function getOrderData(orderId) {
    try {
        if (!orderId) {
            (0, error_manager_1.kaptanLogar)("00024", "orderId is required but it's undefined");
        }
        const elevatedGetOrder = (0, wix_auth_1.elevate)(wix_ecom_backend_1.orders.getOrder);
        const order = await elevatedGetOrder(orderId);
        const readyOrder = { ...order, entityId: order._id };
        delete readyOrder._id;
        return readyOrder;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `failed to get the order data when syncing Wix eCom: ${err}`);
    }
}
