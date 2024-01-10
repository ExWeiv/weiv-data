"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryReferenced = void 0;
const log_handlers_1 = require("../../Log/log_handlers");
const item_helpers_1 = require("../../Helpers/item_helpers");
async function queryReferenced(collectionId, item, propertyName, options) {
    try {
        if (!collectionId) {
            (0, log_handlers_1.reportError)("CollectionID is required when querying items from a reference field");
        }
        if (!item) {
            (0, log_handlers_1.reportError)("The referring item or referring item's ID is required");
        }
        if (typeof item === "string") {
            item = (0, item_helpers_1.convertStringId)(item);
        }
        else {
            item = (0, item_helpers_1.convertStringId)(item._id);
        }
    }
    catch (err) {
        console.error(err);
        return err;
    }
}
exports.queryReferenced = queryReferenced;
