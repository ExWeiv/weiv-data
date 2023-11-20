import { connectionHandler } from '../Helpers/connection_helpers';
import { reportError } from '../Log/log_handlers';
import { getCurrentItemId, getReferences } from '../Helpers/reference_helpers';
import _ from 'lodash';

export async function removeReference(collectionId: string, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        if (!collectionId) {
            reportError("Collection and Database name is required");
        }

        if (!propertyName) {
            reportError("Property name is required");
        }

        if (!referringItem) {
            reportError("Referring item is required");
        }

        if (!referencedItem) {
            reportError("Referenced item is required");
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

        const { modifiedCount } = await collection.updateOne(
            { _id: itemId },
            { ...updateOperation },
            { readConcern: consistentRead === true ? "majority" : "local" }
        );

        if (modifiedCount <= 0) {
            reportError("Operation is not succeed");
        }

        if (cleanupAfter === true) {
            await cleanup();
        }
    } catch (err) {
        console.error(err);
    }
}