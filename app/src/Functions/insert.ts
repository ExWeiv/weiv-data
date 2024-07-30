import { merge } from 'lodash';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, Item, WeivDataOptionsWrite } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { kaptanLogar } from '../Errors/error_manager';
import { convertDocumentIDs, convertToStringId } from '../Helpers/internal_id_converter';
import { getConvertIdsValue } from '../Config/weiv_data_config';

export async function insert(collectionId: CollectionID, item: Item, options?: WeivDataOptionsWrite): Promise<Item> {
    try {
        const { safeItem, safeOptions } = await validateParams<"insert">(
            { collectionId, item, options },
            ["collectionId", "item"],
            "insert"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern, convertIds } = { convertIds: getConvertIdsValue(), ...safeOptions };
        const defaultValues: { [key: string]: any } = {
            _updatedDate: new Date(),
            _createdDate: new Date(),
        }

        // Get owner ID
        defaultValues["_owner"] = await getOwnerId(enableVisitorId);
        const modifiedItem = merge(defaultValues, safeItem);

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [modifiedItem, context]).catch((err) => {
                kaptanLogar("00002", `beforeInsert Hook Failure ${err}`);
            });
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { insertedId, acknowledged } = await collection.insertOne(
            !editedItem ? modifiedItem : editedItem,
            { readConcern }
        );

        if (acknowledged) {
            if (suppressHooks != true) {
                const item = {
                    ...!editedItem ? modifiedItem : editedItem,
                    _id: convertIds ? convertToStringId(insertedId) : insertedId
                }

                const editedResult = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [item, context]).catch((err) => {
                    kaptanLogar("00003", `afterInsert Hook Failure ${err}`);
                });

                if (editedResult) {
                    return convertIds ? convertDocumentIDs(editedResult) : editedResult;
                }
            }

            const item = { ...!editedItem ? modifiedItem : editedItem, _id: insertedId };
            return convertIds ? convertDocumentIDs(item) : item;
        } else {
            kaptanLogar("00016", `acknowledged value returned from MongoDB is not true`);
        }
    } catch (err) {
        kaptanLogar("00016", `when inserting an item into a collection: ${err}`);
    }
}