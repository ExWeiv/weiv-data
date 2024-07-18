import { connectionHandler } from '../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '@exweiv/weiv-data';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { validateParams } from '../Helpers/validator';
import { kaptanLogar } from '../Errors/error_manager';
import { convertDocumentIDs } from '../Helpers/internal_id_converter';
import { convertIdToObjectId } from './id_converters';

export async function multiply(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: number, options?: WeivDataOptions): Promise<Item | null> {
    try {
        const { safeOptions } = await validateParams<"multiply">({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "value", "propertyName"], "multiply");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = safeOptions || {};

        let editedModify = { propertyName, value };
        if (suppressHooks != true) {
            const modifiedParams = await runDataHook<'beforeMultiply'>(collectionId, "beforeMultiply", [{ propertyName, value }, context]).catch((err) => {
                kaptanLogar("00002", `beforeMultiply Hook Failure ${err}`);
            });

            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: convertIdToObjectId(itemId) },
            { $mul: { [editedModify.propertyName]: editedModify.value } },
            { readConcern, returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterMultiply'>(collectionId, "afterMultiply", [convertIds ? convertDocumentIDs(item) : item, context]).catch((err) => {
                    kaptanLogar("00003", `afterMultiply Hook Failure ${err}`);
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
        kaptanLogar("00016", `when multiplying a filed in an item: ${err}`);
    }
}