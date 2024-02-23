"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryReferenced = void 0;
const item_helpers_1 = require("../../Helpers/item_helpers");
const query_referenced_result_1 = require("./query_referenced_result");
async function queryReferenced(collectionId, targetCollectionId, itemId, propertyName, queryOptions, options) {
    try {
        if (!collectionId || !itemId || !targetCollectionId || !propertyName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, targetCollectionId, propertyName or itemId`);
        }
        const editedItemId = (0, item_helpers_1.convertStringId)(itemId);
        const referencedClass = new query_referenced_result_1.InternalWeivDataQueryReferencedResult(collectionId, targetCollectionId, editedItemId, propertyName, queryOptions, options || { suppressAuth: false, suppressHooks: false, readConcern: "local" });
        const result = await referencedClass.getResult();
        return result;
    }
    catch (err) {
        throw Error(`WeivData - Error when querying referenced items: ${err}`);
    }
}
exports.queryReferenced = queryReferenced;
