import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, Item, WeivDataOptionsOwner, BulkUpdateResult } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import type { ObjectId } from 'mongodb';
import { getOwnerId } from '../Helpers/member_id_helpers';

export async function bulkUpdate(collectionId: CollectionID, items: Item[], options?: WeivDataOptionsOwner): Promise<BulkUpdateResult> {
    try {
        const { safeItems, safeOptions } = await validateParams<"bulkUpdate">(
            { collectionId, items, options },
            ["collectionId", "items"],
            "bulkUpdate"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};
        const currentMemberId = await getOwnerId();

        let editedItems: Item[] | Promise<Item[]>[] = safeItems.map(async (item) => {
            item._id = convertStringId(item._id);

            if (suppressHooks != true) {
                const editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                    throw new Error(`beforeUpdate (bulkUpdate) Hook Failure ${err}`);
                });

                if (editedItem) {
                    return editedItem;
                } else {
                    return item;
                }
            } else {
                return item;
            }
        })

        editedItems = await Promise.all(editedItems);

        const bulkOperations = editedItems.map((item) => {
            const filter: { _id: ObjectId, _owner?: string } = { _id: item._id };
            if (onlyOwner) {
                if (currentMemberId) {
                    filter._owner = currentMemberId;
                }
            }

            return {
                updateOne: {
                    filter,
                    update: { $set: { ...item, _updatedDate: new Date() } }
                }
            }
        })

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { modifiedCount, ok } = await collection.bulkWrite(
            bulkOperations,
            { readConcern, ordered: true }
        );

        if (ok) {
            if (suppressHooks != true) {
                editedItems = editedItems.map(async (item) => {
                    const editedItem = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [item, context]).catch((err) => {
                        throw new Error(`afterUpdate (bulkUpdate) Hook Failure ${err}`);
                    });

                    if (editedItem) {
                        return editedItem;
                    } else {
                        return item;
                    }
                })

                editedItems = await Promise.all(editedItems);
            }

            return {
                updated: modifiedCount,
                updatedItems: editedItems
            }
        } else {
            throw new Error(`updated: ${modifiedCount}, ok: ${ok}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when updating items using bulkUpdate: ${err}`);
    }
}