import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, ItemID, WeivDataOptionsOwner, BulkRemoveResult } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { kaptanLogar } from '../Errors/error_manager';
import { convertToStringId } from '../Helpers/internal_id_converter';
import { ObjectId } from 'mongodb';
import { convertIdToObjectId } from './id_converters';

export async function bulkRemove(collectionId: CollectionID, itemIds: ItemID[], options?: WeivDataOptionsOwner): Promise<BulkRemoveResult<ItemID>> {
    try {
        const { safeItemIds, safeOptions } = await validateParams<"bulkRemove">(
            { collectionId, itemIds, options },
            ["collectionId", "itemIds"],
            "bulkRemove"
        )

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = safeOptions || {};

        let currentMemberId: string | null;
        if (onlyOwner) {
            currentMemberId = await getOwnerId();
        }

        let editedItemIds: ItemID[] | Promise<ItemID>[] = safeItemIds.map(async (itemId) => {
            if (suppressHooks != true) {
                const editedId = await runDataHook<'beforeRemove'>(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                    kaptanLogar("00002", `beforeRemove (bulkRemove) Hook Failure ${err}`);
                });

                if (editedId) {
                    return editedId;
                } else {
                    return itemId;
                }
            } else {
                return itemId;
            }
        });

        editedItemIds = await Promise.all(editedItemIds);
        const writeOperations = editedItemIds.map((itemId) => {
            const filter: { _id: ObjectId, _owner?: string } = { _id: convertIdToObjectId(itemId) };

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
                removedItemIds: convertIds ? editedItemIds.map(id => convertToStringId(id)) : editedItemIds
            }
        } else {
            kaptanLogar("00016", `one or more items failed to be deleted`);
        }
    } catch (err) {
        kaptanLogar("00016", `when removing items using bulkRemove: ${err}`);
    }
}