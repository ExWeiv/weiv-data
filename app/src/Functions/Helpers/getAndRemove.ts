import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptionsOwner } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { convertStringId } from '../../Helpers/item_helpers';
import { validateParams } from '../../Helpers/validator';
import type { ObjectId } from 'mongodb';
import { getOwnerId } from '../../Helpers/member_id_helpers';

export async function getAndRemove(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsOwner): Promise<Item | undefined> {
    try {
        const { safeItemId, safeOptions } = await validateParams<"getAndRemove">(
            { collectionId, itemId, options },
            ["collectionId", "itemId"],
            "getAndRemove"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};

        let editedItemId = safeItemId;
        if (suppressHooks != true) {
            const modifiedItemId = await runDataHook<'beforeGetAndRemove'>(collectionId, "beforeGetAndRemove", [safeItemId, context]).catch((err) => {
                throw new Error(`beforeGetAndRemove Hook Failure ${err}`);
            });

            if (modifiedItemId) {
                editedItemId = convertStringId(modifiedItemId);
            }
        }

        const filter: { _id: ObjectId, _owner?: string } = { _id: editedItemId };
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
                const modifiedResult = await runDataHook<'afterGetAndRemove'>(collectionId, "afterGetAndRemove", [item, context]).catch((err) => {
                    throw new Error(`afterGetAndRemove Hook Failure ${err}`);
                });

                if (modifiedResult) {
                    return modifiedResult;
                }
            }

            return item;
        } else {
            return undefined;
        }
    } catch (err) {
        throw new Error(`WeivData - Error when removing an item from collection (getAndRemove): ${err}`);
    }
}