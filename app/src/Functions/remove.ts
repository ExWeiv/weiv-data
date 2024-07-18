import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptionsOwner } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import type { ObjectId } from 'mongodb';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { kaptanLogar } from '../Errors/error_manager';
import { convertDocumentIDs } from '../Helpers/internal_id_converter';
import { convertIdToObjectId } from './id_converters';

export async function remove(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsOwner): Promise<Item | null> {
    try {
        const { safeItemId, safeOptions } = await validateParams<"remove">({ collectionId, itemId, options }, ["collectionId", "itemId"], "remove");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = safeOptions || {};

        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await runDataHook<'beforeRemove'>(collectionId, "beforeRemove", [safeItemId, context]).catch((err) => {
                kaptanLogar("00002", `beforeRemove Hook Failure ${err}`);
            });
        }

        let newItemId = safeItemId;
        if (editedItemId) {
            newItemId = convertIdToObjectId(editedItemId);
        }

        const filter: { _id: ObjectId, _owner?: string } = { _id: newItemId };
        if (onlyOwner) {
            const currentMemberId = await getOwnerId();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndDelete(
            filter,
            { readConcern, includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                let editedItem = await runDataHook<'afterRemove'>(collectionId, 'afterRemove', [convertIds ? convertDocumentIDs(item) : item, context]).catch((err) => {
                    kaptanLogar("00003", `afterRemove Hook Failure ${err}`);
                });

                if (editedItem) {
                    return convertIds ? convertDocumentIDs(editedItem) : editedItem;
                }
            }

            return convertIds ? convertDocumentIDs(item) : item;
        } else {
            return null;
        }
    } catch (err) {
        kaptanLogar("00016", `when removing an item from collection: ${err}`);
    }
}