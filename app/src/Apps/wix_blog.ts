import type { Document } from "mongodb";
import { kaptanLogar } from "../Errors/error_manager";
import { insert } from "../Functions/insert";
import { native } from "../Functions/native";
import { sleep } from "./sleep";

//@ts-ignore
import wixData from 'wix-data';
import { getWeivDataConfigs } from "../Config/weiv_data_config";

const logCollection = "WeivDataWixAppsSyncLogs/WixBlog";

// BLOG POSTS
export async function onPostCreated(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const postId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Post Created - ${postId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const readyBlogPost = await getBlogPostData(postId);
        (await native(`${syncDatabase}/WixBlogPosts`, true)).insertOne(readyBlogPost, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog post couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create blog post when syncing Wix Blog: ${err}`);
    }
}

export async function onPostUpdated(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const postId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Post Updated - ${postId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const filter = { "entityId": { $eq: postId } };
        const readyBlogPost = await getBlogPostData(postId);
        (await native(`${syncDatabase}/WixBlogPosts`, true)).updateOne(filter, { $set: readyBlogPost }, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog post couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update blog post when syncing Wix Blog: ${err}`);
    }
}

export async function onPostDeleted(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }

        // Get required information
        const postId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Post Deleted - ${postId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const filter = { "entityId": { $eq: postId } };
        (await native(`${syncDatabase}/WixBlogPosts`, true)).deleteMany(filter, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog post couldn't be deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't delete blog post when syncing Wix Blog: ${err}`);
    }
}

// BLOG CATEGORIES
export async function onCategoryCreated(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const categoryId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Category Created - ${categoryId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const readyCategoryData = await getBlogCategoryData(categoryId);
        (await native(`${syncDatabase}/WixBlogCategories`, true)).insertOne(readyCategoryData, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog category couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create blog category when syncing Wix Blog: ${err}`);
    }
}

export async function onCategoryUpdated(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const categoryId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Category Updated - ${categoryId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const filter = { "entityId": { $eq: categoryId } };
        const readyCategoryData = await getBlogCategoryData(categoryId);
        (await native(`${syncDatabase}/WixBlogCategories`, true)).updateOne(filter, { $set: readyCategoryData }, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog category couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update blog category when syncing Wix Blog: ${err}`);
    }
}

export async function onCategoryDeleted(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }

        // Get required information
        const categoryId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Category Deleted - ${categoryId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const filter = { "entityId": { $eq: categoryId } };
        (await native(`${syncDatabase}/WixBlogCategories`, true)).deleteMany(filter, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog category couldn't be deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't delete blog category when syncing Wix Blog: ${err}`);
    }
}

// BLOG TAGS
export async function onTagCreated(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const tagId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Tag Created - ${tagId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const readyTagData = await getBlogTagData(tagId);
        (await native(`${syncDatabase}/WixBlogTags`, true)).insertOne(readyTagData, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog tag couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't create blog tag when syncing Wix Blog: ${err}`);
    }
}

export async function onTagUpdated(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }
        await sleep(1000);

        // Get required information
        const tagId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Tag Updated - ${tagId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const filter = { "entityId": { $eq: tagId } };
        const readyTagData = await getBlogTagData(tagId);
        (await native(`${syncDatabase}/WixBlogTags`, true)).updateOne(filter, { $set: readyTagData }, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog tag couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't update blog tag when syncing Wix Blog: ${err}`);
    }
}

export async function onTagDeleted(event: Document): Promise<void> {
    try {
        if (!event) { kaptanLogar("00025"); }

        // Get required information
        const tagId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = getWeivDataConfigs();

        if (enableSyncLogs) {
            console.info(`Wix Blog Tag Deleted - ${tagId}`);
        }

        if (!syncDatabase) { kaptanLogar("00026"); }

        const filter = { "entityId": { $eq: tagId } };
        (await native(`${syncDatabase}/WixBlogTags`, true)).deleteMany(filter, { retryWrites: true });
    } catch (err) {
        // Log Error (fire and forget)
        insert(logCollection, {
            message: "Blog tag couldn't be deeleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });

        kaptanLogar("00024", `Couldn't delete blog tag when syncing Wix Blog: ${err}`);
    }
}

// HELPER FUNCTIONS
async function getBlogPostData(postId: string): Promise<Document> {
    try {
        if (!postId) {
            kaptanLogar("00024", `postId is required but it's undefined or invalid when syncing Wix Blog`);
        }

        const blogPost = await wixData.get("Blog/Posts", postId, { suppressAuth: true, consistentRead: true });
        const readyBlogPost = { ...blogPost, entityId: blogPost._id };
        delete readyBlogPost._id;
        return readyBlogPost;
    } catch (err) {
        kaptanLogar("00024", `failed to get blog post data when syncing Wix Blog: ${err}`);
    }
}

async function getBlogCategoryData(categoryId: string): Promise<Document> {
    try {
        if (!categoryId) {
            kaptanLogar("00024", `categoryId is required but it's undefined or invalid when syncing Wix Blog`);
        }

        const blogCategory = await wixData.get("Blog/Categories", categoryId, { suppressAuth: true, consistentRead: true });
        const readyBlogCategory = { ...blogCategory, entityId: categoryId };
        delete readyBlogCategory._id;
        return readyBlogCategory;
    } catch (err) {
        kaptanLogar("00024", `failed to get blog category data when syncing Wix Blog: ${err}`);
    }
}

async function getBlogTagData(tagId: string): Promise<Document> {
    try {
        if (!tagId) {
            kaptanLogar("00024", `tagId is required but it's undefined or invalid when syncing Wix Blog`);
        }

        const blogTag = await wixData.get("Blog/Tags", tagId, { suppressAuth: true, consistentRead: true });
        const readyBlogTag = { ...blogTag, entityId: blogTag._id };
        delete readyBlogTag._id;
        return readyBlogTag;
    } catch (err) {
        kaptanLogar("00024", `failed to get blog tag data when syncing Wix Blog: ${err}`);
    }
}