import { connectionHandler } from '../Helpers/connection_helpers';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import type { CollectionID, ItemID, WeivDataOptions, Item } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { kaptanLogar } from '../Errors/error_manager';
import { convertDocumentIDs } from '../Helpers/internal_id_converter';
import { convertIdToObjectId } from './id_converters';

export async function pull(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: any, options?: WeivDataOptions): Promise<Item | null> {
    try {
        const { safeValue, safeOptions } = await validateParams<"pull">({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "value", "propertyName"], "pull");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = safeOptions || {};

        let editedModify = { propertyName, value: safeValue };
        if (suppressHooks != true) {
            const modifiedParams = await runDataHook<'beforePull'>(collectionId, "beforePull", [{ propertyName, value: safeValue }, context]).catch((err) => {
                kaptanLogar("00002", `beforePull Hook Failure ${err}`);
            });

            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: convertIdToObjectId(itemId) },
            { $pull: { [editedModify.propertyName]: editedModify.value } },
            { readConcern, returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterPull'>(collectionId, "afterPull", [convertIds ? convertDocumentIDs(item) : item, context]).catch((err) => {
                    kaptanLogar("00003", `afterPull Hook Failure ${err}`);
                });

                if (modifiedResult) {
                    return convertIds ? convertDocumentIDs(modifiedResult) : modifiedResult;
                }
            }

            return convertIds ? convertDocumentIDs(item) : item;
        } else {
            return null;
        }
    } catch (err) {
        kaptanLogar("00016", `when removıng (pullıng) value/s from an array filed in an item: ${err}`);
    }
}