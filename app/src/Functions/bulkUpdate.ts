import { merge } from 'lodash';
import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';
import { convertStringId } from '../Helpers/item_helpers';

/**
 * @description Updates a number of items in a collection.
 * @param collectionId The ID of the collection that contains the item to update.
 * @param item The items to update.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The results of the bulk save. Rejected - The error that caused the rejection.
 */
export async function bulkUpdate(collectionId: string, items: DataItemValues[], options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when updating an item from a collection");
        }

        if (!items) {
            reportError("items are required when bulk updating");
        } else {
            for (const item of items) {
                if (!item._id) {
                    reportError("_id is required in the item object when updating");
                }
            }
        }

        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date()
        }

        items = items.map((item) => {
            item._id = convertStringId(item._id);
            item = merge(item, defaultValues);
            return item;
        })

        const query = {
            _id: { $in: items.map((item) => item._id) },
        };

        const updateObjects = items.map((item) => ({
            $set: item.updatedFields,
        }));

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);

        let succeed = true;
        let updated = 0;
        for (let i = 0; i < items.length; i += 50) {
            const updateBatch = updateObjects.slice(i, i + 50);
            const { modifiedCount, acknowledged } = await collection.updateMany(query, updateBatch, { readConcern: consistentRead === true ? "majority" : "local" });
            succeed = acknowledged;
            updated = updated + modifiedCount;
        }

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (succeed === true) {
            return {
                updated,
                updatedItemIds: items.map((item) => item._id)
            }
        } else {
            reportError('Failed to update items');
        }
    } catch (err) {
        console.error(err); //@ts-ignore
        return err;
    }
}