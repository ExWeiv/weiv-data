import { CollectionID, Item, WeivDataOptions } from '../../weivdata';
import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';

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

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || {};

        // Add _createdDate if there is not one
        if (!item._createdDate) {
            item._createdDate = new Date();
        }

        // Update _updatedDate value
        item._updatedDate = new Date();

        // Convert ID to ObjectId if exist
        let editedItem;
        if (item._id && typeof item._id === "string") {
            item._id = convertStringId(item._id);

            if (suppressHooks != true) {
                editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        } else {
            if (suppressHooks != true) {
                editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeInsert (save) Hook Failure ${err}`);
                });
            }
        }

        editedItem = {
            ...item,
            ...editedItem
        }

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const filter = editedItem._id ? { _id: editedItem._id } : {};
        const { upsertedId, acknowledged } = await collection.updateOne(filter, { $set: editedItem }, { readConcern: consistentRead === true ? "majority" : "local", upsert: true });

        if (cleanupAfter === true) {
            await cleanup();
        }

        const returnedItem = { ...editedItem, _id: editedItem._id }

        if (acknowledged) {
            // Hooks handling
            if (upsertedId) {
                // Item Inserted
                const editedResult = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [returnedItem, context]).catch((err) => {
                    throw Error(`WeivData - afterInsert Hook Failure ${err}`);
                });

                if (editedResult) {
                    return { item: editedResult, upsertedId };
                } else {
                    return { item: returnedItem, upsertedId };
                }
            } else {
                // Item Updated
                const editedResult = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [returnedItem, context]).catch((err) => {
                    throw Error(`WeivData - afterUpdate Hook Failure ${err}`);
                });

                if (editedResult) {
                    return { item: editedResult };
                } else {
                    return { item: returnedItem };
                }
            }
        } else {
            throw Error(`WeivData - Error when saving an item to collection, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when saving an item to collection: ${err}`);
    }
}