import { connectionHandler } from '../Helpers/connection_helpers';
import { convertObjectId, convertStringId } from '../Helpers/item_helpers';
import type { ObjectId } from 'mongodb/mongodb';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, ItemID, WeivDataOptionsOwner, BulkRemoveResult } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { getOwnerId } from '../Helpers/member_id_helpers';

export async function bulkRemove(collectionId: CollectionID, itemIds: ItemID[], options?: WeivDataOptionsOwner): Promise<BulkRemoveResult> {
    try {
        const { safeItemIds, safeOptions } = await validateParams<"bulkRemove">(
            { collectionId, itemIds, options },
            ["collectionId", "itemIds"],
            "bulkRemove"
        )

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};

        let currentMemberId: string | null;
        if (onlyOwner) {
            currentMemberId = await getOwnerId();
        }

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

        const writeOperations = editedItemIds.map((itemId) => {
            const filter: { _id: ObjectId, _owner?: string } = { _id: itemId };
            if (onlyOwner && currentMemberId) {
                filter._owner = currentMemberId;
            }

            return { deleteOne: { filter } }
        });

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { deletedCount, ok } = await collection.bulkWrite(
            writeOperations,
            { readConcern, ordered: true }
        );

        if (ok) {
            return {
                removed: deletedCount,
                removedItemIds: editedItemIds.map(id => convertObjectId(id))
            }
        } else {
            throw new Error(`removed: ${deletedCount}, ok: ${ok}`)
        }
    } catch (err) {
        throw new Error(`WeivData - Error when removing items using bulkRemove: ${err}`);
    }
}