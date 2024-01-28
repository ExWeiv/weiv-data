import { connectionHandler } from '../Helpers/connection_helpers';
import { getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import _ from 'lodash';

export async function removeReference(collectionId: string, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<object> {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }

        const { suppressAuth, cleanupAfter, consistentRead } = options || { suppressAuth: false, cleanupAfter: false, consistentRead: false };
        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne(
            { _id: itemId },
            { $pull: { [propertyName]: { $in: references } }, $set: { _updatedDate: new Date() } },
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (!acknowledged || modifiedCount === 0) {
            throw Error(`WeivData - Error when removing references, acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`)
        } else {
            return { result: true, updatedCount: modifiedCount };
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing references: ${err}`);
    }
}