import type { CollectionID, Item, ItemID, WeivDataOptions } from '../Helpers/collection';
import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { ObjectId } from 'mongodb';

/**
 * Object returned for save function.
 * @public
 */
export interface WeivDataSaveResult {
    /**
     * Saved item.
     */
    item: Item;

    /**
     * Inserted item id. (Returned if item is inserted)
     */
    upsertedId?: ItemID;
}

/**
 * Inserts or updates an item in a collection.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // An item/object for save operation
 * const item = {
 *  location: "Riva 7",
 *  _id: "...", // Item id (optional)
 *  availableCPUs: ["M1", "A7", "R1"]
 * }
 * 
 * const result = await weivData.save("Clusters/Riva", itemData)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to save the item to.
 * @param item The item to insert or update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<WeivDataSaveResult>} Fulfilled - The item that was either inserted or updated, depending on whether it previously existed in the collection. Rejected - The error that caused the rejection.
 */
export async function save(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<WeivDataSaveResult> {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = options || {};

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

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { upsertedId, acknowledged } = await collection.updateOne(
            editedItem._id ? { _id: editedItem._id } : { _id: new ObjectId() },
            { $set: { ...editedItem, _updatedDate: new Date() }, $setOnInsert: !editedItem._createdDate ? { _createdDate: new Date() } : {} },
            { readConcern: readConcern ? readConcern : "local", upsert: true }
        );

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