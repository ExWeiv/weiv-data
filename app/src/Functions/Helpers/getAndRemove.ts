import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { convertStringId } from '../../Helpers/item_helpers';
import { validateParams } from '../../Helpers/validator';

export async function getAndRemove(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptions): Promise<Item | undefined> {
    try {
        const { safeItemId, safeOptions } = await validateParams<"getAndRemove">(
            { collectionId, itemId, options },
            ["collectionId", "itemId"],
            "getAndRemove"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

        let editedItemId = safeItemId;
        if (suppressHooks != true) {
            const modifiedItemId = await runDataHook<'beforeGetAndRemove'>(collectionId, "beforeGetAndRemove", [safeItemId, context]).catch((err) => {
                throw Error(`WeivData - beforeGetAndRemove Hook Failure ${err}`);
            });

            if (modifiedItemId) {
                editedItemId = convertStringId(modifiedItemId);
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndDelete(
            { _id: editedItemId },
            { readConcern: readConcern ? readConcern : "local", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterGetAndRemove'>(collectionId, "afterGetAndRemove", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGetAndRemove Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when removing an item from collection (getAndRemove): ${err}`);
    }
}