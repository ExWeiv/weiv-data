import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { validateParams } from '../../Helpers/validator';

export async function getAndReplace(collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptions): Promise<Item | undefined> {
    try {
        const { safeItemId, safeValue, safeOptions } = await validateParams<"getAndReplace">(
            { collectionId, itemId, value, options },
            ["collectionId", "itemId", "value"],
            "getAndReplace"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

        let editedItem = safeValue;
        if (suppressHooks != true) {
            const modifiedItem = await runDataHook<'beforeGetAndReplace'>(collectionId, "beforeGetAndReplace", [safeValue, context]).catch((err) => {
                throw Error(`WeivData - beforeGetAndReplace Hook Failure ${err}`);
            });

            if (modifiedItem) {
                editedItem = modifiedItem;
            }
        }

        delete editedItem._id;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndReplace(
            { _id: safeItemId },
            editedItem,
            { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterGetAndReplace'>(collectionId, "afterGetAndReplace", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterGetAndReplace Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when replacing an item from collection (getAndReplace): ${err}`);
    }
}