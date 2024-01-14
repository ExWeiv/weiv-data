import { merge } from 'lodash';
import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';

/**
 * @description Updates a number of items in a collection.
 * @param collectionId The ID of the collection that contains the item to update.
 * @param item The items to update.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The results of the bulk save. Rejected - The error that caused the rejection.
 */
export async function bulkUpdate(collectionId: string, items: DataItemValuesUpdate[], options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId || !items) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }

        for (const item of items) {
            if (!item._id) {
                throw Error(`WeivData - Item (_id) ID is required for each item when bulk updating ID is missing for one or more item in your array!`);
            }
        }

        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date()
        }

        const editedItems = items.map((item) => {
            item._id = convertStringId(item._id);
            item = merge(defaultValues, item);
            return item;
        })

        const query = {
            _id: { $in: editedItems.map((item) => convertStringId(item._id)) },
        };

        const updateObjects = editedItems.map((item) => ({
            $set: item.updatedFields,
        }));

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);

        let succeed = true;
        let updated = 0;
        for (let i = 0; i < editedItems.length; i += 50) {
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
                updatedItemIds: editedItems.map((item) => item._id)
            }
        } else {
            throw Error(`WeivData - Error when updating items using bulkUpdate, acknowledged: ${succeed}, updated: ${updated}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when updating items using bulkUpdate: ${err}`);
    }
}