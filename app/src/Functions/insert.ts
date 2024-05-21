import { merge } from 'lodash';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import type { CollectionID, Item, WeivDataOptionsWrite } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { convertObjectId } from '../Helpers/item_helpers';

export async function insert(collectionId: CollectionID, item: Item, options?: WeivDataOptionsWrite): Promise<Item> {
    try {
        const { safeItem, safeOptions } = await validateParams<"insert">(
            { collectionId, item, options },
            ["collectionId", "item"],
            "insert"
        );

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern } = safeOptions || {};
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
                throw new Error(`beforeInsert Hook Failure ${err}`);
            });
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { insertedId, acknowledged } = await collection.insertOne(
            !editedItem ? modifiedItem : editedItem,
            { readConcern }
        );

        if (acknowledged) {
            if (suppressHooks != true) {
                const editedResult = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [{ ...!editedItem ? modifiedItem : editedItem, _id: insertedId }, context]).catch((err) => {
                    throw new Error(`afterInsert Hook Failure ${err}`);
                });

                if (editedResult) {
                    if (editedResult._id) {
                        editedResult._id = convertObjectId(editedResult._id);
                    }
                    return editedResult;
                }
            }

            const item = { ...!editedItem ? modifiedItem : editedItem, _id: insertedId };

            if (item._id) {
                return {
                    ...item,
                    _id: convertObjectId(item._id)
                }
            } else {
                return item;
            }
        } else {
            throw new Error(`acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when inserting an item into a collection: ${err}`);
    }
}