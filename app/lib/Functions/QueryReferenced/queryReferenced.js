"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryReferenced = queryReferenced;
const query_referenced_result_1 = require("./query_referenced_result");
const validator_1 = require("../../Helpers/validator");
const error_manager_1 = require("../../Errors/error_manager");
async function queryReferenced(collectionId, targetCollectionId, itemId, propertyName, queryOptions, options) {
    try {
        const { safeItemId, safeQueryOptions, safeOptions } = await (0, validator_1.validateParams)({ collectionId, targetCollectionId, itemId, propertyName, queryOptions, options }, ["collectionId", "targetCollectionId", "itemId", "propertyName"], "queryReferenced");
        const referencedClass = new query_referenced_result_1.QueryReferencedResult(collectionId, targetCollectionId, safeItemId, propertyName, safeQueryOptions || { pageSize: 50, order: 'asc' }, safeOptions || {});
        return await referencedClass.getResult();
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00017", `when querying referenced items: ${err}`);
    }
}
