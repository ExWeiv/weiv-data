import { connectionHandler } from '../Helpers/connection_helpers';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { convertStringId } from '../Helpers/item_helpers';
import type { CollectionID, ItemID, WeivDataOptions, Item } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';

export async function pull(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: any, options?: WeivDataOptions): Promise<Item | null> {
    try {
        const { safeValue, safeOptions } = await validateParams<"pull">({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "value", "propertyName"], "pull");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

        let editedModify = { propertyName, value: safeValue };
        if (suppressHooks != true) {
            const modifiedParams = await runDataHook<'beforePull'>(collectionId, "beforePull", [{ propertyName, value: safeValue }, context]).catch((err) => {
                throw Error(`WeivData - beforePull Hook Failure ${err}`);
            });

            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: convertStringId(itemId) },
            { $pull: { [editedModify.propertyName]: editedModify.value } },
            { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterPull'>(collectionId, "afterPull", [item, context]).catch((err) => {
                    throw Error(`WeivData - afterPull Hook Failure ${err}`);
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
        throw Error(`WeivData - Error when removıng (pullıng) value/s from an array filed in an item: ${err}`);
    }
}