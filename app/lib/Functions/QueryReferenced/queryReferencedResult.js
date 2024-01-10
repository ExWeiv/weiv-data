"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQueryReferencedResult = void 0;
const log_handlers_1 = require("../../Log/log_handlers");
const connection_provider_1 = require("../../Connection/connection_provider");
class DataQueryReferencedResult {
    constructor(options) {
        this.suppressAuth = false;
        this.suppressHooks = false;
        this.consistentRead = false;
        this.cleanupAfter = false;
        this.limit = 50;
        this.skip = 0;
        const { collectionId, item, propertyName, suppressAuth, suppressHooks, consistentRead, cleanupAfter, targetCollection, limit, skip } = options;
        if (!collectionId || !item || !propertyName || !targetCollection) {
            (0, log_handlers_1.reportError)("Required Param/s Missing");
        }
        this.collectionId = collectionId;
        this.item = item;
        this.propertyName = propertyName;
        this.suppressAuth = suppressAuth ?? this.suppressAuth;
        this.suppressHooks = suppressHooks ?? this.suppressHooks;
        this.consistentRead = consistentRead ?? this.consistentRead;
        this.cleanupAfter = cleanupAfter ?? this.cleanupAfter;
        this.targetCollection = targetCollection;
        this.limit = limit;
        this.skip = skip;
    }
    async getItems() {
        try {
        }
        catch (err) {
            console.error(err);
            return err;
        }
    }
    async connectionHandler(suppressAuth) {
        const { pool, cleanup, memberId } = await (0, connection_provider_1.useClient)(suppressAuth);
        if (this.dbName) {
            this.db = pool.db(this.dbName);
        }
        else {
            this.db = pool.db("exweiv");
        }
        const collection = this.db.collection(this.collectionName);
        return { collection, cleanup, memberId };
    }
}
exports.DataQueryReferencedResult = DataQueryReferencedResult;
