import { merge } from 'lodash';
import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';

/**
 * @description Updates an item in a collection.
 * @param collectionId The ID of the collection that contains the item to update.
 * @param item The item to update.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The object that was updated. Rejected - The error that caused the rejection.
 */
export async function update(collectionId: string, item: DataItemValuesUpdate, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId || !item._id) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item._id`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date()
        }

        const itemId = convertStringId(item._id);
        const updateItem: { [key: string]: any } = merge(item, defaultValues);
        delete updateItem._id;

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { ok, value, lastErrorObject } = await collection.findOneAndUpdate({ _id: itemId }, { $set: updateItem }, { readConcern: consistentRead === true ? "majority" : "local", returnDocument: "after" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (ok === 1) {
            return value || {};
        } else {
            throw Error(`WeivData - Error when updating an item, acknowledged: ${lastErrorObject}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when updating an item: ${err}`);
    }
}