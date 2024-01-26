import { connectionHandler } from '../Helpers/connection_helpers';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { convertStringId, resultIdConverter } from '../Helpers/item_helpers';

/**
 * @description Inserts or updates a number of items in a collection.
 * @param collectionId The ID of the collection to save the items to.
 * @param items The items to insert or update.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The results of the bulk save. Rejected - The error that caused the rejection.
 */
export async function bulkSave(collectionId: string, items: DataItemValues[], options?: WeivDataOptions): Promise<object | void> {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };

        let ownerId = "";
        if (enableOwnerId === true) {
            ownerId = await getOwnerId();
        }

        const newItems = items.map((item) => {
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
        const bulkOperations = newItems.map((item) => {
            if (item._id) {
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: { $set: item },
                        upsert: true
                    }
                }
            } else {
                return {
                    insertOne: {
                        document: item
                    }
                }
            }
        })

        console.log(newItems, bulkOperations);

        const { insertedCount, modifiedCount, insertedIds } = await collection.bulkWrite(bulkOperations, { readConcern: consistentRead === true ? "majority" : "local" })

        if (cleanupAfter === true) {
            await cleanup();
        }

        // // Hooks handling
        // if (upsertedId) {
        //     // Item Inserted
        // } else {
        //     // Item Updated
        // }

        return {
            insertedItemIds: resultIdConverter(insertedIds),
            inserted: insertedCount,
            updated: modifiedCount,
            savedItems: newItems
        }
    } catch (err) {
        throw Error(`WeivData - Error when saving items using bulkSave: ${err}`);
    }
}