import { CollectionID, Item, WeivDataOptions } from '../../weivdata';
import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';

/**
 * Inserts or updates an item in a collection.
 * 
 * @param collectionId The ID of the collection to save the item to.
 * @param item The item to insert or update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<object>} Fulfilled - The item that was either inserted or updated, depending on whether it previously existed in the collection. Rejected - The error that caused the rejection.
 */
export async function save(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};

        // Convert ID to ObjectId if exist
        let itemId;
        if (item._id && typeof item._id === "string") {
            itemId = convertStringId(item._id);
        }

        // Add _createdDate if there is not one
        if (!item._createdDate) {
            item._createdDate = new Date();
        }

        // Update _updatedDate value
        item._updatedDate = new Date();

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const filter = itemId ? { _id: itemId } : {};
        const { upsertedId, acknowledged } = await collection.updateOne(filter, { $set: item }, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });

        if (cleanupAfter === true) {
            await cleanup();
        }

        const returnedItem = { ...item, _id: itemId }

        if (acknowledged) {
            // Hooks handling
            if (upsertedId) {
                // Item Inserted

                return { item: returnedItem, upsertedId };
            } else {
                // Item Updated

                return { item: returnedItem };
            }
        } else {
            throw Error(`WeivData - Error when saving an item to collection, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when saving an item to collection: ${err}`);
    }
}