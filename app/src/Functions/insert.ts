import { merge } from 'lodash';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { connectionHandler } from '../Helpers/connection_helpers';

/**
 * @description Adds an item to a collection.
 * @param collectionId The ID of the collection to add the item to.
 * @param item The item to add.
 * @param options An object containing options to use when processing this operation.
 * @returns Fulfilled - The item that was added. Rejected - The error that caused the rejection.
 */
export async function insert(collectionId: string, item: DataItemValuesInsert, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId || !item) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, item`);
        }

        const { suppressAuth, suppressHooks, cleanupAfter, enableVisitorId, consistentRead } = options || { suppressAuth: false, suppressHooks: false, cleanupAfter: false, consistentRead: false };
        const defaultValues: { [key: string]: any } = {
            _updatedDate: new Date(),
            _createdDate: new Date(),
        }

        // Get owner ID
        defaultValues["_owner"] = await getOwnerId(enableVisitorId);
        const modifiedItem = merge(defaultValues, item);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { insertedId, acknowledged } = await collection.insertOne(modifiedItem, { readConcern: consistentRead === true ? "majority" : "local" });

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (acknowledged) {
            return { ...item, _id: insertedId };
        } else {
            throw Error(`WeivData - Error when inserting an item into a collection, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when inserting an item into a collection: ${err}`);
    }
}