import { merge } from 'lodash';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';

/**
 * @description Adds a number of items to a collection.
 * @param collectionId The ID of the collection to add the items to.
 * @param items The items to add.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The results of the bulk insert. Rejected - The error that caused the rejection.
 */
export async function bulkInsert(collectionId: string, items: DataItemValuesInsert[], options?: WeivDataOptions): Promise<BulkInsertResult> {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date(),
            _createdDate: new Date(),
            _owner: ""
        }

        if (enableOwnerId === true) {
            defaultValues._owner = await getOwnerId();
        }

        for (const item of items) {
            item._updatedDate = new Date();
            item._createdDate = new Date();
            item._owner = "";
        }

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { insertedIds, insertedCount, acknowledged } = await collection.insertMany(items);

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged === true) {
            return { insertedItems: items, insertedItemIds: insertedIds, inserted: insertedCount };
        } else {
            throw Error(`WeivData - Error when inserting items using bulkInsert, acknowledged: ${acknowledged}, insertedCount: ${insertedCount}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when inserting items using bulkInsert: ${err}`);
    }
}