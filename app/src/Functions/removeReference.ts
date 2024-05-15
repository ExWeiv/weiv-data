import type { CollectionID, WeivDataOptions, ReferringItem, ReferencedItem } from '@exweiv/weiv-data';
import { connectionHandler } from '../Helpers/connection_helpers';
import { validateParams } from '../Helpers/validator';

export async function removeReference(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        const { safeOptions, safeReferencedItemIds, safeReferringItemId } = await validateParams<"removeReference">(
            { collectionId, propertyName, referringItem, referencedItem, options },
            ["collectionId", "propertyName", "referringItem", "referencedItem"],
            "removeReference"
        );

        const { suppressAuth, readConcern } = safeOptions || {};

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne(
            { _id: safeReferringItemId },
            { $pull: { [propertyName]: { $in: safeReferencedItemIds } }, $set: { _updatedDate: new Date() } },
            { readConcern: readConcern ? readConcern : "local" }
        );

        if (!acknowledged || modifiedCount <= 0) {
            throw Error(`WeivData - Error when removing references, acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`)
        }
    } catch (err) {
        throw Error(`WeivData - Error when removing references: ${err}`);
    }
}