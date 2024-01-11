import { merge } from 'lodash';
import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';
import { convertStringId } from '../Helpers/item_helpers';

/**
 * @description Updates an item in a collection.
 * @param collectionId The ID of the collection that contains the item to update.
 * @param item The item to update.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The object that was updated. Rejected - The error that caused the rejection.
 */
export async function update(collectionId: string, item: DataItemValues, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when updating an item from a collection");
        }

        if (!item._id) {
            reportError("_id is required in the item object when updating");
        }

        const { suppressAuth, suppressHooks, cleanupAfter, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date()
        }

        item._id = convertStringId(item._id);
        item = merge(item, defaultValues);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        await collection.updateOne({ _id: item._id }, { $set: item }, { readConcern: consistentRead === true ? "majority" : "local" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        return item;
    } catch (err) {
        console.error(err); //@ts-ignore
        return err;
    }
}