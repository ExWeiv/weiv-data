"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onProductCreated = onProductCreated;
exports.onProductUpdated = onProductUpdated;
exports.onProductDeleted = onProductDeleted;
exports.onCollectionCreated = onCollectionCreated;
exports.onCollectionUpdated = onCollectionUpdated;
exports.onCollectionDeleted = onCollectionDeleted;
const error_manager_1 = require("../Errors/error_manager");
const insert_1 = require("../Functions/insert");
const native_1 = require("../Functions/native");
const sleep_1 = require("./sleep");
const wix_data_1 = __importDefault(require("wix-data"));
const weiv_data_config_1 = require("../Config/weiv_data_config");
const logCollection = "WeivDataWixAppsSyncLogs/WixStores";
async function onProductCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const productId = event._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Stores Product Created - ${productId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const { readyInventoryData, readyProductData, readyVariantsData } = await getProductData(productId);
        const variantsWrites = readyVariantsData.map((variant) => { return { insertOne: { document: variant } }; });
        const inventoryItemsWrites = readyInventoryData.map((inventoryItem) => { return { insertOne: { document: inventoryItem } }; });
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixStoresProducts`, true)).insertOne(readyProductData, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixStoresVariants`, true)).bulkWrite(variantsWrites, { ordered: false, retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixStoresInventoryItems`, true)).bulkWrite(inventoryItemsWrites, { ordered: false, retryWrites: true })
        ]);
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Stores product couldn't be created",
            entityId: event._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create product when syncing Wix Stores: ${err}`);
    }
}
async function onProductUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const productId = event.productId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Stores Product Updated - ${productId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const { readyInventoryData, readyProductData, readyVariantsData } = await getProductData(productId);
        const filter = { "entityId": { $eq: productId } };
        const variantsWrites = readyVariantsData.map((variant) => {
            return {
                updateOne: {
                    filter: { "entityId": { $eq: variant.entityId } },
                    update: { $set: variant }
                }
            };
        });
        const inventoryItemsWrites = readyInventoryData.map((inventoryItem) => {
            return {
                updateOne: {
                    filter: { "entityId": { $eq: inventoryItem.entityId } },
                    update: { $set: inventoryItem }
                }
            };
        });
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixStoresProducts`, true)).updateOne(filter, { $set: readyProductData }, { retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixStoresVariants`, true)).bulkWrite(variantsWrites, { ordered: false, retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixStoresInventoryItems`, true)).bulkWrite(inventoryItemsWrites, { ordered: false, retryWrites: true })
        ]);
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Stores product couldn't be updated",
            entityId: event.productId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update product when syncing Wix Stores: ${err}`);
    }
}
async function onProductDeleted(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const productId = event.productId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Stores Product Deleted - ${productId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "productId": { $eq: productId } };
        Promise.all([
            (await (0, native_1.native)(`${syncDatabase}/WixStoresProducts`, true)).deleteMany({ "entityId": { $eq: productId } }, { ordered: false, retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixStoresVariants`, true)).deleteMany(filter, { ordered: false, retryWrites: true }),
            (await (0, native_1.native)(`${syncDatabase}/WixStoresInventoryItems`, true)).deleteMany(filter, { ordered: false, retryWrites: true })
        ]);
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Stores product couldn't deleted",
            entityId: event.productId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't delete product when syncing Wix Stores: ${err}`);
    }
}
async function onCollectionCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(4000);
        const collectionId = event._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Stores Collection Created - ${collectionId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const collection = await getCollectionData(collectionId);
        (await (0, native_1.native)(`${syncDatabase}/WixStoresCollections`)).insertOne(collection, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Stores collection couldn't be created",
            entityId: event._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create collection when syncing Wix Stores: ${err}`);
    }
}
async function onCollectionUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const collectionId = event.collectionId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Stores Collection Updated - ${collectionId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const collection = await getCollectionData(collectionId);
        const filter = { "entityId": { $eq: collection.entityId } };
        (await (0, native_1.native)(`${syncDatabase}/WixStoresCollections`)).updateOne(filter, { $set: collection }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Stores collection couldn't be updated",
            entityId: event.collectionId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update collection when syncing Wix Stores: ${err}`);
    }
}
async function onCollectionDeleted(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const collectionId = event.collectionId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Stores Collection Deleted - ${collectionId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: collectionId } };
        (await (0, native_1.native)(`${syncDatabase}/WixStoresCollections`)).deleteMany(filter, { ordered: false, retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Stores collection couldn't deleted",
            entityId: event.collectionId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't delete collection when syncing Wix Stores: ${err}`);
    }
}
async function getProductData(productId) {
    try {
        if (!productId) {
            (0, error_manager_1.kaptanLogar)("00024", "ProductId is undefined when syncing Wix Stores");
        }
        const options = {
            suppressAuth: true,
            consistentRead: true,
            appOptions: { includeVariants: true, includeHiddenProducts: true },
            omitTotalCount: false
        };
        const productData = await wix_data_1.default.query("Stores/Products").eq("_id", productId).include("collections").find(options);
        if (productData.items.length === 0) {
            (0, error_manager_1.kaptanLogar)("00024", `Product not found when syncing Wix Stores products: ${productId}`);
        }
        const product = { ...productData.items[0], collections: productData.items[0].collections.map((c) => c._id), entityId: productData.items[0]._id };
        delete product._id;
        const variantsResults = await wix_data_1.default.query("Stores/Variants").eq("productId", productId).limit(100).find(options);
        let variants = variantsResults.items;
        while (variantsResults.hasNext()) {
            const nextPage = await variantsResults.next();
            variants = variants.concat(nextPage.items);
        }
        variants = variants.map((variant) => {
            const vr = { ...variant, entityId: variant._id };
            delete vr._id;
            return vr;
        });
        const inventoryItemsResult = await wix_data_1.default.query("Stores/InventoryItems").eq("productId", productId).limit(100).find(options);
        let inventoryItems = inventoryItemsResult.items;
        while (inventoryItemsResult.hasNext()) {
            const nextPage = await inventoryItemsResult.next();
            inventoryItems = inventoryItems.concat(nextPage.items);
        }
        inventoryItems = inventoryItems.map((item) => {
            const it = { ...item, entityId: item._id };
            delete it._id;
            return it;
        });
        return {
            readyInventoryData: inventoryItems,
            readyProductData: product,
            readyVariantsData: variants
        };
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't get product data when syncing Wix Stores: ${err}`);
    }
}
async function getCollectionData(collectionId) {
    try {
        if (!collectionId) {
            (0, error_manager_1.kaptanLogar)("00024", "CollectionId is undefined when syncing Wix Stores");
        }
        const collection = await wix_data_1.default.get("Stores/Collections", collectionId, { suppressAuth: true, consistentRead: true });
        const readyCollectionData = { ...collection, entityId: collection._id };
        delete readyCollectionData._id;
        return readyCollectionData;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't get collection data when syncing Wix Stores: ${err}`);
    }
}
