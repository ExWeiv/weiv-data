import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptionsOwner } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { validateParams } from '../../Helpers/validator';
import type { ObjectId } from 'mongodb';
import { getOwnerId } from '../../Helpers/member_id_helpers';
import { kaptanLogar } from '../../Errors/error_manager';
import { convertDocumentIDs } from '../../Helpers/internal_id_converter';
import { getConvertIdsValue } from '../../Config/weiv_data_config';

export async function getAndUpdate(collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptionsOwner): Promise<Item | undefined> {
    try {
        const { safeItemId, safeValue, safeOptions } = await validateParams<"getAndUpdate">(
            { collectionId, itemId, value, options },
            ["collectionId", "itemId", "value"],
            "getAndUpdate"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = { convertIds: getConvertIdsValue(), ...safeOptions };

        let editedItem = safeValue;
        if (suppressHooks != true) {
            const modifiedItem = await runDataHook<'beforeGetAndUpdate'>(collectionId, "beforeGetAndUpdate", [safeValue, context]).catch((err) => {
                kaptanLogar("00002", `beforeGetAndUpdate Hook Failure ${err}`);
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
                const modifiedResult = await runDataHook<'afterGetAndUpdate'>(collectionId, "afterGetAndUpdate", [convertIds ? convertDocumentIDs(item) : item, context]).catch((err) => {
                    kaptanLogar("00003", `afterGetAndUpdate Hook Failure ${err}`);
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
        kaptanLogar("00016", `when updating an item from collection (getAndUpdate): ${err}`);
    }
}