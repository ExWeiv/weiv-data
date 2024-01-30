import { convertStringId } from '../../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';
import { QueryReferencedResult } from './query_referenced_result';

export async function queryReferenced(collectionId: string, targetCollectionId: string, itemId: string | ObjectId, propertyName: string, queryOptions: QueryReferencedOptions, options?: WeivDataOptions) {
    try {
        if (!collectionId || !itemId || !targetCollectionId || !propertyName) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, targetCollectionId, propertyName or itemId`);
        }

        const editedItemId = convertStringId(itemId);
        const referencedClass = new QueryReferencedResult(collectionId, targetCollectionId, editedItemId, propertyName, queryOptions, options || {});
        const result = await referencedClass.getResult();
        return result;
    } catch (err) {
        throw Error(`WeivData - Error when querying referenced items: ${err}`);
    }
}