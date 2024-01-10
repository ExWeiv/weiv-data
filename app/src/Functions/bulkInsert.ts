import { merge } from 'lodash';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';

/**
 * @description Adds a number of items to a collection.
 * @param collectionId The ID of the collection to add the items to.
 * @param items The items to add.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The results of the bulk insert. Rejected - The error that caused the rejection.
 */
export async function bulkInsert(collectionId: string, items: DataItemValues[], options?: WeivDataOptions): Promise<bulkInsertResult> {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when inserting an item in a collection");
        }

        if (items.length === 0) {
            reportError('Items array is empty');
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

        items = items.map((item) => {
            item = merge(item, defaultValues);
            return item;
        })

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { insertedIds, insertedCount, acknowledged } = await collection.insertMany(items);

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged === true) {
            return { insertedItems: items, insertedItemIds: insertedIds, inserted: insertedCount };
        } else {
            reportError('Failed to insert items!');
        }
    } catch (err) {
        console.error(err); //@ts-ignore
        return err;
    }
}