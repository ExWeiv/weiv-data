import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, ItemID, WeivDataOptions, BulkRemoveResult } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';

export async function bulkRemove(collectionId: CollectionID, itemIds: ItemID[], options?: WeivDataOptions): Promise<BulkRemoveResult> {
    try {
        const { safeItemIds, safeOptions } = await validateParams<"bulkRemove">(
            { collectionId, itemIds, options },
            ["collectionId", "itemIds"],
            "bulkRemove"
        )

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

        let editedItemIds: ObjectId[] | Promise<ObjectId>[] = safeItemIds.map(async (itemId) => {
            if (suppressHooks != true) {
                const editedId = await runDataHook<'beforeRemove'>(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                    throw new Error(`beforeRemove (bulkRemove) Hook Failure ${err}`);
                });

                if (editedId) {
                    return convertStringId(editedId);
                } else {
                    return convertStringId(itemId);
                }
            } else {
                return convertStringId(itemId);
            }
        })

        editedItemIds = await Promise.all(editedItemIds);
        const writeOperations = await editedItemIds.map((itemId) => {
            return {
                deleteOne: {
                    filter: { _id: itemId },
                }
            }
        });

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { deletedCount, ok } = await collection.bulkWrite(
            writeOperations,
            { readConcern: readConcern ? readConcern : "local", ordered: true }
        );

        if (ok) {
            return {
                removed: deletedCount,
                removedItemIds: editedItemIds
            }
        } else {
            throw new Error(`removed: ${deletedCount}, ok: ${ok}`)
        }
    } catch (err) {
        throw new Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}