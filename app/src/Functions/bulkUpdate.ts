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

        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        const editedItems = items.map((item) => {
            item._id = convertStringId(item._id);
            return {
                ...item,
                _updatedDate: new Date()
            }
        })

        const bulkOperations = editedItems.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: item }
                }
            }
        })
        console.log(editedItems, bulkOperations);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { matchedCount } = await collection.bulkWrite(bulkOperations, { readConcern: consistentRead === true ? "majority" : "local" })

        if (cleanupAfter === true) {
            await cleanup();
        }

        return {
            updated: matchedCount,
            updatedItems: editedItems
        }
    } catch (err) {
        throw Error(`WeivData - Error when updating items using bulkUpdate: ${err}`);
    }
}