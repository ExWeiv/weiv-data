import { connectionHandler } from '../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '@exweiv/weiv-data';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { convertStringId } from '../Helpers/item_helpers';
import { validateParams } from '../Helpers/validator';

export async function increment(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: number, options?: WeivDataOptions): Promise<Item | null> {
    try {
        const { safeOptions } = await validateParams<"increment">(
            { collectionId, itemId, propertyName, value, options },
            ["collectionId", "itemId", "propertyName", "value"],
            "increment"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

        let editedModify = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedParams = await runDataHook<'beforeIncrement'>(collectionId, "beforeIncrement", [{ propertyName, value }, context]).catch((err) => {
                throw Error(`WeivData - beforeIncrement Hook Failure ${err}`);
            });

            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: convertStringId(itemId) },
            { $inc: { [editedModify.propertyName]: editedModify.value } },
            { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterIncrement'>(collectionId, "afterIncrement", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterIncrement Hook Failure ${err}`);
                });

                if (modifiedResult) {
                    return modifiedResult;
                }
            }

            return item;
        } else {
            return null;
        }
    } catch (err) {
        throw Error(`WeivData - Error when incrementing a filed in an item: ${err}`);
    }
}