import { connectionHandler } from '../../Helpers/connection_helpers';
import type { CollectionID, Item, WeivDataOptions } from '@exweiv/weiv-data';
import { prepareHookContext } from '../../Helpers/hook_helpers';
import { runDataHook } from '../../Hooks/hook_manager';
import { validateParams } from '../../Helpers/validator';
import { kaptanLogar } from '../../Errors/error_manager';
import { convertDocumentIDs } from '../../Helpers/internal_id_converter';
import { getConvertIdsValue } from '../../Config/weiv_data_config';

export async function findOne(collectionId: CollectionID, propertyName: string, value: any, options?: WeivDataOptions): Promise<Item | undefined> {
    try {
        const { safeValue, safeOptions } = await validateParams<"findOne">(
            { collectionId, propertyName, value, options },
            ["collectionId", "propertyName", "value"],
            "findOne"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, convertIds } = { convertIds: getConvertIdsValue(), ...safeOptions };

        let editedFilter = { propertyName, value: safeValue };
        if (suppressHooks != true) {
            const modifiedFilter = await runDataHook<'beforeFindOne'>(collectionId, "beforeFindOne", [{ propertyName, value: safeValue }, context]).catch((err) => {
                kaptanLogar("00002", `beforeFindOne Hook Failure ${err}`);
            });

            if (modifiedFilter) {
                editedFilter = modifiedFilter;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne(
            { [editedFilter.propertyName]: editedFilter.value },
            { readConcern }
        );

        if (item) {
            if (suppressHooks != true) {
                const modifiedResult = await runDataHook<'afterFindOne'>(collectionId, "afterFindOne", [convertIds ? convertDocumentIDs(item) : item, context]).catch((err) => {
                    kaptanLogar("00003", `afterFindOne Hook Failure ${err}`);
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
        kaptanLogar("00016", `when finding an item from collection (findOne): ${err}`);
    }
}