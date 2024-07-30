import { connectionHandler } from '../Helpers/connection_helpers';
import type { CollectionID, Item, ItemID, WeivDataOptions } from '@exweiv/weiv-data';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { validateParams } from '../Helpers/validator';
import { kaptanLogar } from '../Errors/error_manager';
import { convertDocumentIDs } from '../Helpers/internal_id_converter';
import { convertIdToObjectId } from './id_converters';
import { getConvertIdsValue } from '../Config/weiv_data_config';

export async function push(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: any, options?: WeivDataOptions): Promise<Item | null> {
    try {
        const { safeValue, safeOptions } = await validateParams<"push">({ collectionId, itemId, propertyName, value, options }, ["collectionId", "itemId", "propertyName", "value"], "push");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = { convertIds: getConvertIdsValue(), ...safeOptions };

        let editedModify = { propertyName, value: safeValue };
        if (suppressHooks != true) {
            const modifiedParams = await runDataHook<'beforePush'>(collectionId, "beforePush", [{ propertyName, value: safeValue }, context]).catch((err) => {
                kaptanLogar("00002", `beforePush Hook Failure ${err}`);
            });

            if (modifiedParams) {
                editedModify = modifiedParams;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOneAndUpdate(
            { _id: convertIdToObjectId(itemId) },
            { $push: { [editedModify.propertyName]: editedModify.value } },
            { readConcern, returnDocument: "after", includeResultMetadata: false }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterPush'>(collectionId, "afterPush", [convertIds ? convertDocumentIDs(item) : item, context]).catch((err) => {
                    kaptanLogar("00003", `afterPush Hook Failure ${err}`);
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
        kaptanLogar("00016", `when inserting (pushing) new value/s into an array filed in an item: ${err}`);
    }
}