import { connectionHandler } from '../Helpers/connection_helpers';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { convertObjectId, convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, Item, BulkSaveResult, WeivDataOptionsWriteOwner } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import type { ObjectId } from 'mongodb';

export async function bulkSave(collectionId: CollectionID, items: Item[], options?: WeivDataOptionsWriteOwner): Promise<BulkSaveResult> {
    try {
        const { safeItems, safeOptions } = await validateParams<"bulkSave">(
            { collectionId, items, options },
            ["collectionId", "items"],
            "bulkSave"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern, onlyOwner } = safeOptions || {};
        const currentMemberId = await getOwnerId(enableVisitorId);

        let ownerId = await getOwnerId(enableVisitorId);
        let editedItems: Item[] | Promise<Item[]>[] = safeItems.map(async (item) => {
            if (!item._owner) {
                item._owner = ownerId;
            }

            // Convert ID to ObjectId if exist
            if (item._id) {
                // Run beforeUpdate hook for that item.
                if (suppressHooks != true) {
                    const editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                        throw new Error(`beforeUpdate (bulkSave) Hook Failure ${err}`);
                    })

                    if (editedItem) {
                        editedItem._id = convertStringId(editedItem._id);
                        return editedItem;
                    } else {
                        item._id = convertStringId(item._id);
                        return item;
                    }
                } else {
                    item._id = convertStringId(item._id);
                    return item;
                }
            } else {
                // Run beforeInsert hook for that item.
                // Save owner id into item
                item._owner = currentMemberId;
                if (suppressHooks != true) {
                    const editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [item, context]).catch((err) => {
                        throw new Error(`beforeInsert (bulkSave) Hook Failure ${err}`);
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
                const filter: { _id: ObjectId, _owner?: string } = { _id: item._id };
                if (onlyOwner) {
                    if (currentMemberId) {
                        filter._owner = currentMemberId;
                    }
                }

                return {
                    updateOne: {
                        filter,
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
        const { insertedCount, modifiedCount, insertedIds, ok } = await collection.bulkWrite(
            bulkOperations,
            { readConcern }
        );

        if (ok) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    if (item._id) {
                        // Convert to string
                        item._id = convertObjectId(item._id);

                        // Run afterUpdate hook for that item.
                        const editedItem = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [item, context]).catch((err) => {
                            throw new Error(`afterUpdate (bulkSave) Hook Failure ${err}`);
                        });

                        if (editedItem) {
                            return editedItem;
                        } else {
                            return item;
                        }
                    } else {
                        // Run afterInsert hook for that item.
                        const editedItem = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [item, context]).catch((err) => {
                            throw new Error(`afterInsert Hook Failure ${err}`);
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

            const editedInsertedIds: string[] = Object.keys(insertedIds).map((key) => {
                return convertObjectId(insertedIds[key as any]);
            });

            return {
                insertedItemIds: editedInsertedIds,
                inserted: insertedCount,
                updated: modifiedCount,
                savedItems: editedItems
            }
        } else {
            throw new Error(`inserted: ${insertedCount}, updated: ${modifiedCount}, ok: ${ok}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when saving items using bulkSave: ${err}`);
    }
}