import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptionsOwner } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { validateParams } from '../../Helpers/validator';
import type { ObjectId } from 'mongodb';
import { getOwnerId } from '../../Helpers/member_id_helpers';
import { kaptanLogar } from '../../Errors/error_manager';
import { convertDocumentIDs } from '../../Helpers/internal_id_converter';
import { convertIdToObjectId } from '../id_converters';

export async function getAndRemove(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsOwner): Promise<Item | undefined> {
    try {
        const { safeItemId, safeOptions } = await validateParams<"getAndRemove">(
            { collectionId, itemId, options },
            ["collectionId", "itemId"],
            "getAndRemove"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = safeOptions || {};

        let editedItemId = safeItemId;
        if (suppressHooks != true) {
            const modifiedItemId = await runDataHook<'beforeGetAndRemove'>(collectionId, "beforeGetAndRemove", [safeItemId, context]).catch((err) => {
                kaptanLogar("00002", `beforeGetAndRemove Hook Failure ${err}`);
            });

            if (modifiedItemId) {
                editedItemId = convertIdToObjectId(modifiedItemId);
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
                const modifiedResult = await runDataHook<'afterGetAndRemove'>(collectionId, "afterGetAndRemove", [convertIds ? convertDocumentIDs(item) : item, context]).catch((err) => {
                    kaptanLogar("00003", `afterGetAndRemove Hook Failure ${err}`);
                });

                if (modifiedResult) {
                    return convertIds ? convertDocumentIDs(modifiedResult) : modifiedResult;
                }
            }

            return convertIds ? convertDocumentIDs(item) : item;
        } else {
            return undefined;
        }
    } catch (err) {
        kaptanLogar("00016", `when removing an item from collection (getAndRemove): ${err}`);
    }
}