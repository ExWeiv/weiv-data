import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { Document, ObjectId } from 'mongodb/mongodb';
import type { CollectionID, Items, WeivDataOptions } from '../Helpers/collection';

/**
 * Adds a number of items to a collection.
 * 
 * @public
 */
export interface BulkInsertResult {
    insertedItems: Items,
    insertedItemIds: {
        [key: number]: ObjectId;
    },
    inserted: number
}

/**
 * Adds a number of items to a collection.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // Items that will be bulk inserted
 * const itemsToInsert = [{...}, {...}, {...}]
 * 
 * const result = await weivData.bulkInsert("Clusters/Odunpazari", itemsToInsert)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to add the items to.
 * @param items The items to add.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<BulkInsertResult>} Fulfilled - The results of the bulk insert. Rejected - The error that caused the rejection.
 */
export async function bulkInsert(collectionId: CollectionID, items: Items, options?: WeivDataOptions): Promise<BulkInsertResult> {
    try {
        if (!collectionId || !items || items.length <= 0) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, items`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, consistentRead } = options || {};

        let ownerId = await getOwnerId(enableVisitorId);
        let editedItems: Document[] | Promise<Document>[] = items.map(async (item) => {
            item._updatedDate = new Date();
            item._createdDate = new Date();
            item._owner = ownerId;

            if (suppressHooks != true) {
                let editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [item, context]).catch((err) => {
                    throw Error(`WeivData - beforeInsert (bulkInsert) Hook Failure ${err}`);
                });

                if (editedItem) {
                    item = editedItem;
                }
            }

            return item;
        })

        editedItems = await Promise.all(editedItems);
        const writeOperations = editedItems.map((value) => {
            return {
                insertOne: {
                    document: value
                }
            }
        })

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { insertedIds, insertedCount, hasWriteErrors, getWriteErrors } = await collection.bulkWrite(
            writeOperations,
            { readConcern: consistentRead === true ? "majority" : "local", ordered: true }
        );

        const insertedItemIds = Object.keys(insertedIds).map((key: any) => {
            return insertedIds[key];
        })

        if (!hasWriteErrors()) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    const editedInsertItem = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [item, context]).catch((err) => {
                        throw Error(`WeivData - afterInsert (bulkInsert) Hook Failure ${err}`);
                    });

                    if (editedInsertItem) {
                        return editedInsertItem;
                    } else {
                        return item;
                    }
                })

                editedItems = await Promise.all(editedItems);
            }

            return { insertedItems: editedItems, insertedItemIds, inserted: insertedCount };
        } else {
            throw Error(`WeivData - Error when inserting items using bulkInsert, inserted: ${insertedCount}, write errors: ${getWriteErrors()}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when inserting items using bulkInsert: ${err}`);
    }
}