import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { Document } from 'mongodb/mongodb';
import type { CollectionID, Item, BulkInsertResult, WeivDataOptionsWrite } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { convertObjectId } from '../Helpers/item_helpers';

export async function bulkInsert(collectionId: CollectionID, items: Item[], options?: WeivDataOptionsWrite): Promise<BulkInsertResult> {
    try {
        const { safeItems, safeOptions } = await validateParams<"bulkInsert">(
            { collectionId, items, options },
            ["collectionId", "items"],
            "bulkInsert"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern } = safeOptions || {};

        let ownerId = await getOwnerId(enableVisitorId);
        let editedItems: Document[] | Promise<Document>[] = safeItems.map(async (item) => {
            item._updatedDate = new Date();
            item._createdDate = new Date();
            item._owner = ownerId;

            if (suppressHooks != true) {
                let editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [item, context]).catch((err) => {
                    throw new Error(`beforeInsert (bulkInsert) Hook Failure ${err}`);
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
        const { insertedIds, insertedCount, ok } = await collection.bulkWrite(
            writeOperations,
            { readConcern, ordered: true }
        );

        const insertedItemIds = Object.keys(insertedIds).map((key) => {
            return convertObjectId(insertedIds[key as any]);
        })

        if (ok) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    if (item._id) {
                        item._id = convertObjectId(item._id);
                    }

                    const editedInsertItem = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [item, context]).catch((err) => {
                        throw new Error(`afterInsert (bulkInsert) Hook Failure ${err}`);
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
            throw new Error(`inserted: ${insertedCount}, ok: ${ok}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when inserting items using bulkInsert: ${err}`);
    }
}