import { merge } from 'lodash';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers'

/**
 * @description Adds an item to a collection.
 * @param collectionId The ID of the collection to add the item to.
 * @param item The item to add.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The item that was added. Rejected - The error that caused the rejection.
 */
export async function insert(collectionId: string, item: DataItemValues, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId) {
            reportError("CollectionID is required when inserting an item in a collection");
        }

        const { suppressAuth, suppressHooks, cleanupAfter, enableOwnerId } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, enableOwnerId: true };
        const defaultValues = {
            _updatedDate: new Date(),
            _createdDate: new Date(),
            _owner: ""
        }

        if (enableOwnerId === true) {
            defaultValues._owner = await getOwnerId();
        }

        item = merge(item, defaultValues);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { insertedId } = await collection.insertOne(item);

        if (cleanupAfter === true) {
            await cleanup();
        }

        return { ...item, _id: insertedId };
    } catch (err) {
        console.error(err); //@ts-ignore
        return err;
    }
}