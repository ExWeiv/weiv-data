"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insert = void 0;
const lodash_1 = require("lodash");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
async function insert(collectionId, item, options) {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }
        const { suppressAuth, suppressHooks, cleanupAfter, enableVisitorId } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        const defaultValues = {
            _updatedDate: new Date(),
            _createdDate: new Date()
        };
        defaultValues["_owner"] = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        const modifiedItem = (0, lodash_1.merge)(defaultValues, item);
        const { collection, cleanup } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedId, acknowledged } = await collection.insertOne({
            ...modifiedItem,
            _id: typeof modifiedItem._id === "string" ? (0, item_helpers_1.convertStringId)(modifiedItem._id) : modifiedItem._id
        });
        if (cleanupAfter === true) {
            await cleanup();
        }
        if (acknowledged) {
            return { ...item, _id: insertedId };
        }
        else {
            throw Error(`WeivData - Error when inserting an item into a collection, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when inserting an item into a collection: ${err}`);
    }
}
exports.insert = insert;
