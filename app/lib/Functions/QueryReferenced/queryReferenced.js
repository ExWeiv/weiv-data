"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryReferenced = void 0;
const query_referenced_result_1 = require("./query_referenced_result");
const validator_1 = require("../../Helpers/validator");
async function queryReferenced(collectionId, targetCollectionId, itemId, propertyName, queryOptions, options) {
    try {
        const { safeItemId, safeQueryOptions, safeOptions } = await (0, validator_1.validateParams)({ collectionId, targetCollectionId, itemId, propertyName, queryOptions, options }, ["collectionId", "targetCollectionId", "itemId", "propertyName", "queryOptions"], "queryReferenced");
        const referencedClass = new query_referenced_result_1.QueryReferencedResult(collectionId, targetCollectionId, safeItemId, propertyName, safeQueryOptions, safeOptions || {});
        const result = await referencedClass.getResult();
        return result;
    }
    catch (err) {
        throw new Error(`WeivData - Error when querying referenced items: ${err}`);
    }
}
exports.queryReferenced = queryReferenced;
