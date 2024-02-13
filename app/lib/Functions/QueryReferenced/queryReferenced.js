"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryReferenced = void 0;
const item_helpers_1 = require("../../Helpers/item_helpers");
const query_referenced_result_1 = require("./query_referenced_result");
/**
 * Gets the full items referenced in the specified property.
 *
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 *
 * // Item ID that will be used when searching for references
 * const itemId = "..."
 *
 * const result = await weivData.queryReferenced("Clusters/All", "clusterLocations", itemId, {consistentRead: true})
 *
 * if (result.hasNext()) {
 *  const nextPage = await result.next();
 *  console.log(result, nextPage);
 * } else {
 *  console.log(result);
 * }
 * ```
 *
 * @param collectionId The ID of the collection that contains the referring item.
 * @param targetCollectionId The ID of the collection that contains the referenced items.
 * @param itemId The referring item's ID.
 * @param propertyName The property that contains the references to the referenced items.
 * @param queryOptions An object containing options to use when querying referenced items.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<WeivDataQueryReferencedResult>} Fulfilled - The referenced items. Rejected - The error that caused the rejection.
 */
async function queryReferenced(collectionId, targetCollectionId, itemId, propertyName, queryOptions, options) {
    try {
        if (!collectionId || !itemId || !targetCollectionId || !propertyName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, targetCollectionId, propertyName or itemId`);
        }
        const editedItemId = (0, item_helpers_1.convertStringId)(itemId);
        const referencedClass = new query_referenced_result_1.InternalWeivDataQueryReferencedResult(collectionId, targetCollectionId, editedItemId, propertyName, queryOptions, options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, consistentRead: false });
        const result = await referencedClass.getResult();
        return result;
    }
    catch (err) {
        throw Error(`WeivData - Error when querying referenced items: ${err}`);
    }
}
exports.queryReferenced = queryReferenced;
