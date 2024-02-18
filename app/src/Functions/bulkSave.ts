import { connectionHandler } from '../Helpers/connection_helpers';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, ItemIDs, Items, WeivDataOptions } from '../Helpers/collection';

/**
 * Object returned for bulkSave function.
 * @public
 */
export interface WeivDataBulkSaveResult {
    /**
     * Number of inserted items.
     */
    inserted: number;

    /**
     * Number of updated items.
     */
    updated: number;

    /**
     * Saved items.
     */
    savedItems: Items;

    /**
     * Inserted item ids.
     */
    insertedItemIds: ItemIDs
}

/**
 * Inserts or updates a number of items in a collection.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // Items that will be bulk saved
 * const itemsToSave = [{...}, {...}, {...}]
 * 
 * const result = await weivData.bulkSave("Clusters/Odunpazari", itemsToSave)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to save the items to.
 * @param items The items to insert or update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<WeivDataBulkSaveResult | void>} Fulfilled - The results of the bulk save. Rejected - The error that caused the rejection.
 */
export async function bulkSave(collectionId: CollectionID, items: Items, options?: WeivDataOptions): Promise<WeivDataBulkSaveResult | void> {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, consistentRead } = options || {};

        let ownerId = await getOwnerId(enableVisitorId);
        let editedItems: Items | Promise<Items>[] = items.map(async (item) => {
            if (!item._owner) {
                item._owner = ownerId;
            }

            // Convert ID to ObjectId if exist
            if (item._id) {
                // Run beforeUpdate hook for that item.
                if (suppressHooks != true) {
                    const editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                        throw Error(`WeivData - beforeUpdate (bulkSave) Hook Failure ${err}`);
                    })

                    if (editedItem) {
                        return editedItem;
                    } else {
                        return item;
                    }
                } else {
                    item._id = convertStringId(item._id);
                    return item;
                }
            } else {
                // Run beforeInsert hook for that item.
                if (suppressHooks != true) {
                    const editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [item, context]).catch((err) => {
                        throw Error(`WeivData - beforeInsert (bulkSave) Hook Failure ${err}`);
                    });

                    if (editedItem) {
                        return editedItem;
                    } else {
                        return item;
                    }
                } else {
                    return item;
                }
            }
        })

        editedItems = await Promise.all(editedItems);
        const bulkOperations = editedItems.map((item) => {
            if (item._id) {
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: { $set: { ...item, _updatedDate: new Date() }, $setOnInsert: !item._createdDate ? { _createdDate: new Date() } : {} },
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

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { insertedCount, modifiedCount, insertedIds } = await collection.bulkWrite(
            bulkOperations,
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (suppressHooks != true) {
            editedItems = editedItems.map(async (item) => {
                if (item._id) {
                    // Run afterUpdate hook for that item.
                    const editedItem = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [item, context]).catch((err) => {
                        throw Error(`WeivData - afterUpdate (bulkSave) Hook Failure ${err}`);
                    });

                    if (editedItem) {
                        return editedItem;
                    } else {
                        return item;
                    }
                } else {
                    // Run afterInsert hook for that item.
                    const editedItem = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [item, context]).catch((err) => {
                        throw Error(`WeivData - afterInsert Hook Failure ${err}`);
                    });

                    if (editedItem) {
                        return editedItem;
                    } else {
                        return item;
                    }
                }
            })

            editedItems = await Promise.all(editedItems);
        }

        const editedInsertedIds = Object.keys(insertedIds).map((key: any) => {
            return convertStringId(insertedIds[key]);
        })

        return {
            insertedItemIds: editedInsertedIds,
            inserted: insertedCount,
            updated: modifiedCount,
            savedItems: editedItems
        }
    } catch (err) {
        throw Error(`WeivData - Error when saving items using bulkSave: ${err}`);
    }
}