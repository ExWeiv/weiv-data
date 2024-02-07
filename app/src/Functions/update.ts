import { merge } from 'lodash';
import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptions } from '../../weivdata';

/**
 * Updates an item in a collection.
 * 
 * @param collectionId The ID of the collection that contains the item to update.
 * @param item The item to update.
 * @param options An object containing options to use when processing this operation.
 * @returns {Promise<object>} Fulfilled - The object that was updated. Rejected - The error that caused the rejection.
 */
export async function update(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId || !item._id) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item._id`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };
        const defaultValues = {
            _updatedDate: new Date()
        }

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                throw Error(`WeivData - beforeUpdate Hook Failure ${err}`);
            });
        }

        const itemId = !editedItem ? convertStringId(item._id) : convertStringId(editedItem._id);
        const updateItem: { [key: string]: any } = merge(!editedItem ? item : editedItem, defaultValues);
        delete updateItem._id;

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { ok, value, lastErrorObject } = await collection.findOneAndUpdate({ _id: itemId }, { $set: updateItem }, { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (ok === 1 && value) {
            if (suppressHooks != true) {
                let editedResult = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [value, context]).catch((err) => {
                    throw Error(`WeivData - afterUpdate Hook Failure ${err}`);
                });

                if (editedResult) {
                    return editedResult;
                }
            }

            return value;
        } else {
            throw Error(`WeivData - Error when updating an item, acknowledged: ${lastErrorObject}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when updating an item: ${err}`);
    }
}