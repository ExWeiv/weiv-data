import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { ObjectId } from 'mongodb/mongodb';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';

/**
 * @description Removes an item from a collection.
 * @param collectionId The ID of the collection to remove the item from.
 * @param itemId The ID of the item to remove.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The removed item, or null if the item was not found. Rejected - The error that caused the rejection.
 */
export async function remove(collectionId: string, itemId: ObjectId | string, options?: WeivDataOptions): Promise<object | null> {
    try {
        if (!collectionId || !itemId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, itemId`);
        }

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false };

        let editedItemId;
        if (suppressHooks != true) {
            editedItemId = await runDataHook<'beforeRemove'>(collectionId, "beforeRemove", [itemId, context]).catch((err) => {
                throw Error(`WeivData - beforeRemove Hook Failure ${err}`);
            });
        }

        let newItemId;
        if (editedItemId) {
            newItemId = convertStringId(editedItemId);
        } else {
            newItemId = convertStringId(itemId);
        }

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const item = await collection.findOne({ _id: newItemId });
        const { acknowledged, deletedCount } = await collection.deleteOne({ _id: newItemId }, { readConcern: consistentRead === true ? "majority" : "local" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged) {
            if (deletedCount === 1) {
                if (suppressHooks != true) {
                    let editedItem = await runDataHook<'afterRemove'>(collectionId, 'afterRemove', [item, context]).catch((err) => {
                        throw Error(`WeivData - afterRemove Hook Failure ${err}`);
                    });

                    if (editedItem) {
                        return editedItem;
                    }
                }

                return item;
            } else {
                return null;
            }
        } else {
            throw Error(`WeivData - Error when removing an item from collection, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing an item from collection: ${err}`);
    }
}