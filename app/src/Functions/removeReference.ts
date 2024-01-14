import { connectionHandler } from '../Helpers/connection_helpers';
import { getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import _ from 'lodash';

export async function removeReference(collectionId: string, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        if (!collectionId || !propertyName || !referringItem || !referencedItem) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId, propertyName, referringItem, referencedItem`);
        }

        const { suppressAuth, cleanupAfter, consistentRead } = options || { suppressAuth: false, cleanupAfter: false, consistentRead: false };
        const references = getReferences(referencedItem);
        const itemId = getCurrentItemId(referringItem);

        const { collection, cleanup } = await connectionHandler(collectionId, suppressAuth);
        const document = await collection.findOne({ _id: itemId }, { readConcern: consistentRead === true ? "majority" : "local" });
        const isMultiReference = Array.isArray(document?.[propertyName]);

        const updateOperation = isMultiReference
            ? { $pull: { [propertyName]: { $in: references } }, $set: { _updatedDate: new Date() } }
            : { $set: { [propertyName]: undefined, _updatedDate: new Date() } };

        const { acknowledged } = await collection.updateOne(
            { _id: itemId },
            { ...updateOperation },
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (cleanupAfter === true) {
            await cleanup();
        }

        if (!acknowledged) {
            throw Error(`WeivData - Error when removing references, acknowledged: ${acknowledged}`)
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing references: ${err}`);
    }
}