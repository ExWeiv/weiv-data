import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { validateParams } from '../../Helpers/validator';

export async function getAndUpdate(collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptions): Promise<Item | undefined> {
    try {
        const { safeItemId, safeValue, safeOptions } = await validateParams<"getAndUpdate">(
            { collectionId, itemId, value, options },
            ["collectionId", "itemId", "value"],
            "getAndUpdate"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

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

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: safeItemId },
            { $set: editedItem },
            { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterGetAndUpdate'>(collectionId, "afterGetAndUpdate", [item, context]).catch((err) => {
                    throw new Error(`afterGetAndUpdate Hook Failure ${err}`);
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
        throw new Error(`WeivData - Error when updating an item from collection (getAndUpdate): ${err}`);
    }
}