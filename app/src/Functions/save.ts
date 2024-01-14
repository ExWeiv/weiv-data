import { connectionHandler } from '../Helpers/connection_helpers';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { convertStringId } from '../Helpers/item_helpers';

/**
 * @description Inserts or updates an item in a collection.
 * @param collectionId The ID of the collection to save the item to.
 * @param item The item to insert or update.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The item that was either inserted or updated, depending on whether it previously existed in the collection. Rejected - The error that caused the rejection.
 */
export async function save(collectionId: string, item: DataItemValues, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };

        // Convert ID to ObjectId if exist
        if (item._id && typeof item._id === "string") {
            item._id = convertStringId(item._id);
        }

        // Add _createdDate if there is not one
        if (!item._createdDate) {
            item._createdDate = new Date();
        }

        // Update _updatedDate value
        item._updatedDate = new Date();

        // Set _owner if it's enabled and if there is not one yet
        if (!item._owner && enableOwnerId === true) {
            item._owner = await getOwnerId();
        }

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { upsertedId, acknowledged } = await collection.updateOne(item._id === undefined ? { _id: item._id } : {}, { $set: item }, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged) {
            // Hooks handling
            if (upsertedId) {
                // Item Inserted
            } else {
                // Item Updated
            }

            return item;
        } else {
            throw Error(`WeivData - Error when saving an item to collection, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when saving an item to collection: ${err}`);
    }
}