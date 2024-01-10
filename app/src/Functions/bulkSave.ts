import { connectionHandler } from '../Helpers/connection_helpers';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { convertStringId } from '../Helpers/item_helpers';

/**
 * @description Inserts or updates a number of items in a collection.
 * @param collectionId The ID of the collection to save the items to.
 * @param items The items to insert or update.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The results of the bulk save. Rejected - The error that caused the rejection.
 */
export async function bulkSave(collectionId: string, items: DataItemValues[], options?: WeivDataOptions): Promise<object | void> {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when saving an item in a collection");
        }

        if (!items || items.length === 0) {
            reportError('Items array is required and it should not ve empty');
        }

        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };

        let ownerId = "";
        if (enableOwnerId === true) {
            ownerId = await getOwnerId();
        }

        items = items.map((item) => {
            // Convert ID to ObjectId if exist
            if (item._id) {
                item._id = convertStringId(item._id);
            }

            // Add _createdDate if there is not one
            if (!item._createdDate) {
                item._createdDate = new Date();
            }

            // Update _updatedDate value
            item._updatedDate = new Date();

            if (!item._owner) {
                item._owner = ownerId;
            }

            return item;
        })

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);

        const query = {
            _id: { $in: items.map((item) => item._id) },
        };

        const updateObjects = items.map((item) => ({
            $set: item.updatedFields,
        }));

        let succeed = true;
        let inserted = 0;
        let updated = 0;
        for (let i = 0; i < items.length; i += 50) {
            const updateBatch = updateObjects.slice(i, i + 50);
            const { upsertedCount, acknowledged, modifiedCount } = await collection.updateMany(query, updateBatch, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });
            succeed = acknowledged;
            inserted = inserted + upsertedCount;
            updated = updated + modifiedCount;
        }

        if (cleanupAfter === true) {
            await cleanup();
        }

        // // Hooks handling
        // if (upsertedId) {
        //     // Item Inserted
        // } else {
        //     // Item Updated
        // }

        if (succeed === true) {
            return {
                inserted,
                updated,
                items
            }
        } else {
            reportError('Failed to save items!');
        }
    } catch (err) {
        console.error(err); //@ts-ignore
        return err;
    }
}