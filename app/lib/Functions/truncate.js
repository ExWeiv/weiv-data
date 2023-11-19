"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const log_handlers_1 = require("../Log/log_handlers");
async function truncate(collectionId, options) {
    try {
        if (!collectionId) {
            (0, log_handlers_1.reportError)("CollectionID is required when truncating a collection");
        }
        const { suppressAuth, suppressHooks, cleanupAfter } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        await collection.deleteMany({});
        if (cleanupAfter === true) {
            await cleanup();
        }
        return null;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
exports.truncate = truncate;
