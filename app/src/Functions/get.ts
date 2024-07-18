import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, ItemID, WeivDataOptions } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { kaptanLogar } from '../Errors/error_manager';
import { convertDocumentIDs } from '../Helpers/internal_id_converter';
import { convertIdToObjectId } from './id_converters';

export async function get(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptions): Promise<Item | null> {
    try {
        const { safeOptions, safeItemId } = await validateParams<"get">(
            { collectionId, itemId, options },
            ["collectionId", "itemId"],
            "get"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = safeOptions || {};

        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await runDataHook<'beforeGet'>(collectionId, "beforeGet", [safeItemId, context]).catch((err) => {
                kaptanLogar("00002", `beforeGet Hook Failure ${err}`);
            });
        }

        let newItemId = safeItemId;
        if (editedItemId) {
            newItemId = convertIdToObjectId(editedItemId);
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne(
            { _id: newItemId },
            { readConcern }
        );

        if (item) {
            if (suppressHooks != true) {
                let editedItem = await runDataHook<'afterGet'>(collectionId, 'afterGet', [convertIds ? convertDocumentIDs(item) : item, context]).catch((err) => {
                    kaptanLogar("00003", `afterGet Hook Failure ${err}`);
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
        kaptanLogar("00016", `when trying to get item from the collectin by itemId: ${err}`);
    }
}