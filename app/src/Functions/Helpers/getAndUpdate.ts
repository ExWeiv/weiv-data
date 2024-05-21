import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptionsOwner } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { validateParams } from '../../Helpers/validator';
import type { ObjectId } from 'mongodb';
import { getOwnerId } from '../../Helpers/member_id_helpers';
import { convertObjectId } from '../../Helpers/item_helpers';

export async function getAndUpdate(collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptionsOwner): Promise<Item | undefined> {
    try {
        const { safeItemId, safeValue, safeOptions } = await validateParams<"getAndUpdate">(
            { collectionId, itemId, value, options },
            ["collectionId", "itemId", "value"],
            "getAndUpdate"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};

        let editedItem = safeValue;
        if (suppressHooks != true) {
            const modifiedItem = await runDataHook<'beforeGetAndUpdate'>(collectionId, "beforeGetAndUpdate", [safeValue, context]).catch((err) => {
                throw new Error(`beforeGetAndUpdate Hook Failure ${err}`);
            });

            if (modifiedItem) {
                editedItem = modifiedItem;
            }
        }

        delete editedItem._id;

        const filter: { _id: ObjectId, _owner?: string } = { _id: safeItemId };
        if (onlyOwner) {
            const currentMemberId = await getOwnerId();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            filter,
            { $set: editedItem },
            { readConcern, returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterGetAndUpdate'>(collectionId, "afterGetAndUpdate", [item, context]).catch((err) => {
                    throw new Error(`afterGetAndUpdate Hook Failure ${err}`);
                });

                if (modifiedResult) {
                    if (modifiedResult._id) {
                        modifiedResult._id = convertObjectId(modifiedResult._id);
                    }
                    return modifiedResult;
                }
            }

            if (item._id) {
                return {
                    ...item,
                    _id: convertObjectId(item._id)
                }
            } else {
                return item;
            }
        } else {
            return undefined;
        }
    } catch (err) {
        throw new Error(`WeivData - Error when updating an item from collection (getAndUpdate): ${err}`);
    }
}