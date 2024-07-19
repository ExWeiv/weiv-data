"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPostCreated = onPostCreated;
exports.onPostUpdated = onPostUpdated;
exports.onPostDeleted = onPostDeleted;
exports.onCategoryCreated = onCategoryCreated;
exports.onCategoryUpdated = onCategoryUpdated;
exports.onCategoryDeleted = onCategoryDeleted;
exports.onTagCreated = onTagCreated;
exports.onTagUpdated = onTagUpdated;
exports.onTagDeleted = onTagDeleted;
const error_manager_1 = require("../Errors/error_manager");
const insert_1 = require("../Functions/insert");
const native_1 = require("../Functions/native");
const sleep_1 = require("./sleep");
const wix_data_1 = __importDefault(require("wix-data"));
const weiv_data_config_1 = require("../Config/weiv_data_config");
const logCollection = "WeivDataWixAppsSyncLogs/WixBlog";
async function onPostCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const postId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Post Created - ${postId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyBlogPost = await getBlogPostData(postId);
        (await (0, native_1.native)(`${syncDatabase}/WixBlogPosts`, true)).insertOne(readyBlogPost, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog post couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create blog post when syncing Wix Blog: ${err}`);
    }
}
async function onPostUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const postId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Post Updated - ${postId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: postId } };
        const readyBlogPost = await getBlogPostData(postId);
        (await (0, native_1.native)(`${syncDatabase}/WixBlogPosts`, true)).updateOne(filter, { $set: readyBlogPost }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog post couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update blog post when syncing Wix Blog: ${err}`);
    }
}
async function onPostDeleted(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const postId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Post Deleted - ${postId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: postId } };
        (await (0, native_1.native)(`${syncDatabase}/WixBlogPosts`, true)).deleteMany(filter, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog post couldn't be deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't delete blog post when syncing Wix Blog: ${err}`);
    }
}
async function onCategoryCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const categoryId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Category Created - ${categoryId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyCategoryData = await getBlogCategoryData(categoryId);
        (await (0, native_1.native)(`${syncDatabase}/WixBlogCategories`, true)).insertOne(readyCategoryData, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog category couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create blog category when syncing Wix Blog: ${err}`);
    }
}
async function onCategoryUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const categoryId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Category Updated - ${categoryId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: categoryId } };
        const readyCategoryData = await getBlogCategoryData(categoryId);
        (await (0, native_1.native)(`${syncDatabase}/WixBlogCategories`, true)).updateOne(filter, { $set: readyCategoryData }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog category couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update blog category when syncing Wix Blog: ${err}`);
    }
}
async function onCategoryDeleted(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const categoryId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Category Deleted - ${categoryId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: categoryId } };
        (await (0, native_1.native)(`${syncDatabase}/WixBlogCategories`, true)).deleteMany(filter, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog category couldn't be deleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't delete blog category when syncing Wix Blog: ${err}`);
    }
}
async function onTagCreated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const tagId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Tag Created - ${tagId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const readyTagData = await getBlogTagData(tagId);
        (await (0, native_1.native)(`${syncDatabase}/WixBlogTags`, true)).insertOne(readyTagData, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog tag couldn't be created",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't create blog tag when syncing Wix Blog: ${err}`);
    }
}
async function onTagUpdated(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        await (0, sleep_1.sleep)(1000);
        const tagId = event.entity._id;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Tag Updated - ${tagId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: tagId } };
        const readyTagData = await getBlogTagData(tagId);
        (await (0, native_1.native)(`${syncDatabase}/WixBlogTags`, true)).updateOne(filter, { $set: readyTagData }, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog tag couldn't be updated",
            entityId: event.entity._id,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't update blog tag when syncing Wix Blog: ${err}`);
    }
}
async function onTagDeleted(event) {
    try {
        if (!event) {
            (0, error_manager_1.kaptanLogar)("00025");
        }
        const tagId = event.metadata.entityId;
        const { syncDatabase, enableSyncLogs } = (0, weiv_data_config_1.getWeivDataConfigs)();
        if (enableSyncLogs) {
            console.info(`Wix Blog Tag Deleted - ${tagId}`);
        }
        if (!syncDatabase) {
            (0, error_manager_1.kaptanLogar)("00026");
        }
        const filter = { "entityId": { $eq: tagId } };
        (await (0, native_1.native)(`${syncDatabase}/WixBlogTags`, true)).deleteMany(filter, { retryWrites: true });
    }
    catch (err) {
        (0, insert_1.insert)(logCollection, {
            message: "Blog tag couldn't be deeleted",
            entityId: event.metadata.entityId,
            metadata: event.metadata
        }, { suppressAuth: true, suppressHooks: true });
        (0, error_manager_1.kaptanLogar)("00024", `Couldn't delete blog tag when syncing Wix Blog: ${err}`);
    }
}
async function getBlogPostData(postId) {
    try {
        if (!postId) {
            (0, error_manager_1.kaptanLogar)("00024", `postId is required but it's undefined or invalid when syncing Wix Blog`);
        }
        const blogPost = await wix_data_1.default.get("Blog/Posts", postId, { suppressAuth: true, consistentRead: true });
        const readyBlogPost = { ...blogPost, entityId: blogPost._id };
        delete readyBlogPost._id;
        return readyBlogPost;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `failed to get blog post data when syncing Wix Blog: ${err}`);
    }
}
async function getBlogCategoryData(categoryId) {
    try {
        if (!categoryId) {
            (0, error_manager_1.kaptanLogar)("00024", `categoryId is required but it's undefined or invalid when syncing Wix Blog`);
        }
        const blogCategory = await wix_data_1.default.get("Blog/Categories", categoryId, { suppressAuth: true, consistentRead: true });
        const readyBlogCategory = { ...blogCategory, entityId: blogCategory._id };
        delete readyBlogCategory._id;
        return readyBlogCategory;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `failed to get blog category data when syncing Wix Blog: ${err}`);
    }
}
async function getBlogTagData(tagId) {
    try {
        if (!tagId) {
            (0, error_manager_1.kaptanLogar)("00024", `tagId is required but it's undefined or invalid when syncing Wix Blog`);
        }
        const blogTag = await wix_data_1.default.get("Blog/Tags", tagId, { suppressAuth: true, consistentRead: true });
        const readyBlogTag = { ...blogTag, entityId: blogTag._id };
        delete readyBlogTag._id;
        return readyBlogTag;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00024", `failed to get blog tag data when syncing Wix Blog: ${err}`);
    }
}
