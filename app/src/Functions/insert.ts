import { merge } from 'lodash';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptions } from '../Helpers/collection';

/**
 * Adds an item to a collection.
 * 
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 * 
 * // Item that will be inserted
 * const item = {...}
 * 
 * const result = await weivData.insert("Clusters/All", item)
 * console.log(result);
 * ```
 * 
 * @param collectionId The ID of the collection to add the item to.
 * @param item The item to add.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<Item>} Fulfilled - The item that was added. Rejected - The error that caused the rejection.
 */
export async function insert(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<Item> {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, consistentRead } = options || {};
        const defaultValues: { [key: string]: any } = {
            _updatedDate: new Date(),
            _createdDate: new Date(),
        }

        // Get owner ID
        defaultValues["_owner"] = await getOwnerId(enableVisitorId);
        const modifiedItem = merge(defaultValues, item);

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [modifiedItem, context]).catch((err) => {
                throw Error(`WeivData - beforeInsert Hook Failure ${err}`);
            });
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { insertedId, acknowledged } = await collection.insertOne(!editedItem ? modifiedItem : editedItem, { readConcern: consistentRead === true ? "majority" : "local" });

        if (acknowledged) {
            if (suppressHooks != true) {
                const editedResult = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [{ ...!editedItem ? modifiedItem : editedItem, _id: insertedId }, context]).catch((err) => {
                    throw Error(`WeivData - afterInsert Hook Failure ${err}`);
                });

                if (editedResult) {
                    return editedResult;
                }
            }

            return { ...!editedItem ? modifiedItem : editedItem, _id: insertedId };
        } else {
            throw Error(`WeivData - Error when inserting an item into a collection, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when inserting an item into a collection: ${err}`);
    }
}