import type { Document, AnyBulkWriteOperation } from "mongodb";
import { kaptanLogar } from "../Errors/error_manager";
import { insert } from "../Functions/insert";
import { native } from "../Functions/native";
import { sleep } from "./sleep";

//@ts-ignore
import wixData from 'wix-data';
import { getWeivDataConfigs } from "../Config/weiv_data_config";

const logCollection = "WeivDataWixAppsSyncLogs/WixStores";

// PRODUCTS, VARIANTS, INVENTORY ITEMS 
export async function onProductCreated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00024", "Event data not found, don't forget to pass the event object from the Wix event function");
        }

        await sleep(1000);

        // Get required information
        const productId = event._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Stores Product Created - ${productId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const { readyInventoryData, readyProductData, readyVariantsData } = await getProductData(productId);

        const variantsWrites = readyVariantsData.map((variant: Document): AnyBulkWriteOperation => { return { insertOne: { document: variant } } });
        const inventoryItemsWrites = readyInventoryData.map((inventoryItem: Document): AnyBulkWriteOperation => { return { insertOne: { document: inventoryItem } } });

        Promise.all([
            (await native(`${syncDatabase}/WixStoresProducts`, true)).insertOne(readyProductData, { retryWrites: true }),
            (await native(`${syncDatabase}/WixStoresVariants`, true)).bulkWrite(variantsWrites, { ordered: false, retryWrites: true }),
            (await native(`${syncDatabase}/WixStoresInventoryItems`, true)).bulkWrite(inventoryItemsWrites, { ordered: false, retryWrites: true })
        ]);
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Stores product couldn't be created",
            entityId: event._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create product when syncing Wix Stores: ${err}`);
    }
}

export async function onProductUpdated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00024", "Event data not found, don't forget to pass the event object from the Wix event function");
        }

        await sleep(1000);

        // Get required information
        const productId = event.productId;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Stores Product Updated - ${productId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const { readyInventoryData, readyProductData, readyVariantsData } = await getProductData(productId);
        const filter = { "entityId": { $eq: productId } };

        const variantsWrites = readyVariantsData.map((variant: Document): AnyBulkWriteOperation => {
            return {
                updateOne: {
                    filter: { "entityId": { $eq: variant.entityId } },
                    update: { $set: variant }
                }
            }
        });

        const inventoryItemsWrites = readyInventoryData.map((inventoryItem: Document): AnyBulkWriteOperation => {
            return {
                updateOne: {
                    filter: { "entityId": { $eq: inventoryItem.entityId } },
                    update: { $set: inventoryItem }
                }
            }
        });

        Promise.all([
            (await native(`${syncDatabase}/WixStoresProducts`, true)).updateOne(filter, { $set: readyProductData }, { retryWrites: true }),
            (await native(`${syncDatabase}/WixStoresVariants`, true)).bulkWrite(variantsWrites, { ordered: false, retryWrites: true }),
            (await native(`${syncDatabase}/WixStoresInventoryItems`, true)).bulkWrite(inventoryItemsWrites, { ordered: false, retryWrites: true })
        ]);
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Stores product couldn't be updated",
            entityId: event.productId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update product when syncing Wix Stores: ${err}`);
    }
}

export async function onProductDeleted(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00024", "Event data not found, don't forget to pass the event object from the Wix event function");
        }

        // Get required information
        const productId = event.productId;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Stores Product Deleted - ${productId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const filter = { "productId": { $eq: productId } };

        Promise.all([
            (await native(`${syncDatabase}/WixStoresProducts`, true)).deleteMany(filter, { ordered: false, retryWrites: true }),
            (await native(`${syncDatabase}/WixStoresVariants`, true)).deleteMany(filter, { ordered: false, retryWrites: true }),
            (await native(`${syncDatabase}/WixStoresInventoryItems`, true)).deleteMany(filter, { ordered: false, retryWrites: true })
        ]);
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Stores product couldn't deleted",
            entityId: event.productId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't delete product when syncing Wix Stores: ${err}`);
    }
}

// COLLECTIONS
export async function onCollectionCreated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00024", "Event data not found, don't forget to pass the event object from the Wix event function");
        }

        await sleep(1000);

        // Get required information
        const collectionId = event._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Stores Collection Created - ${collectionId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const collection = await getCollectionData(collectionId);
        (await native(`${syncDatabase}/WixStoresCollections`)).insertOne(collection, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Stores collection couldn't be created",
            entityId: event._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create collection when syncing Wix Stores: ${err}`);
    }
}

export async function onCollectionUpdated(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00024", "Event data not found, don't forget to pass the event object from the Wix event function");
        }

        await sleep(1000);

        // Get required information
        const collectionId = event.collectionId;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Stores Collection Updated - ${collectionId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const collection = await getCollectionData(collectionId);
        const filter = { "entityId": { $eq: collection.entityId } };
        (await native(`${syncDatabase}/WixStoresCollections`)).updateOne(filter, { $set: collection }, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Stores collection couldn't be updated",
            entityId: event.collectionId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update collection when syncing Wix Stores: ${err}`);
    }
}

export async function onCollectionDeleted(event: Document): Promise<void> {
    try {
        if (!event) {
            kaptanLogar("00024", "Event data not found, don't forget to pass the event object from the Wix event function");
        }

        // Get required information
        const collectionId = event.collectionId;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Stores Collection Deleted - ${collectionId}`);
        }

        if (!syncDatabase) {
            kaptanLogar("00024", "You didn't configure any database name to sync Wix apps data!");
        }

        const filter = { "entityId": { $eq: collectionId } };
        (await native(`${syncDatabase}/WixStoresCollections`)).deleteMany(filter, { ordered: false, retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Stores collection couldn't deleted",
            entityId: event.collectionId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't delete collection when syncing Wix Stores: ${err}`);
    }
}

// HELPER FUNCTIONS
type ProductData = {
    readyProductData: Document,
    readyVariantsData: Document,
    readyInventoryData: Document
}

async function getProductData(productId: string): Promise<ProductData> {
    try {
        if (!productId) {
            kaptanLogar("00024", "ProductId is undefined when syncing Wix Stores");
        }

        const options = {
            suppressAuth: true,
            consistentRead: true,
            appOptions: { includeVariants: true, includeHiddenProducts: true },
            omitTotalCount: false
        }

        const productData = await wixData.query("Stores/Products").eq("_id", productId).include("collections").find(options);

        if (productData.items.length === 0) {
            kaptanLogar("00024", `Product not found when syncing Wix Stores products: ${productId}`)
        }

        const product = { ...productData.items[0], collections: productData.items[0].collections.map((c: Document) => c._id), entityId: productData.items[0]._id }
        delete product._id;

        const variantsResults = await wixData.query("Stores/Variants").eq("productId", productId).limit(100).find(options);
        let variants = variantsResults.items;
        while (variantsResults.hasNext()) {
            const nextPage = await variantsResults.next();
            variants = variants.concat(nextPage.items);
        }

        variants = variants.map((variant: Document) => {
            const vr: Document = { ...variant, entityId: variant._id };
            delete vr._id;
            return vr;
        });

        const inventoryItemsResult = await wixData.query("Stores/InventoryItems").eq("productId", productId).limit(100).find(options);
        let inventoryItems = inventoryItemsResult.items;
        while (inventoryItemsResult.hasNext()) {
            const nextPage = await inventoryItemsResult.next();
            inventoryItems = inventoryItems.concat(nextPage.items);
        }

        inventoryItems = inventoryItems.map((item: Document) => {
            const it: Document = { ...item, entityId: item._id };
            delete it._id;
            return it;
        });

        return {
            readyInventoryData: inventoryItems,
            readyProductData: product,
            readyVariantsData: variants
        }
    } catch (err) {
        kaptanLogar("00024", `Couldn't get product data when syncing Wix Stores: ${err}`);
    }
}

async function getCollectionData(collectionId: string): Promise<Document> {
    try {
        if (!collectionId) {
            kaptanLogar("00024", "CollectionId is undefined when syncing Wix Stores");
        }

        const collection = await wixData.get("Stores/Collections", collectionId, { suppressAuth: true, consistentRead: true });
        const readyCollectionData = { ...collection, entityId: collection._id };
        delete readyCollectionData._id;

        return readyCollectionData;
    } catch (err) {
        kaptanLogar("00024", `Couldn't get collection data when syncing Wix Stores: ${err}`);
    }
}