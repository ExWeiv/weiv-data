import { CollectionID, WeivDataOptions } from '@exweiv/weiv-data';
import { connectionHandler } from '../Helpers/connection_helpers';
import { validateParams } from '../Helpers/validator';

export async function truncate(collectionId: CollectionID, options?: WeivDataOptions): Promise<boolean> {
    try {
        // Validate Params
        const { safeOptions } = await validateParams<"truncate">({ collectionId, options }, ["collectionId"], "truncate");

        const { suppressAuth } = safeOptions || {};
        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged } = await collection.deleteMany({});

        if (acknowledged) {
            return true;
        } else {
            throw new Error(`couldn't remove all items in the collection, acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when removing all items in a collection (truncate): ${err}`);
    }
}