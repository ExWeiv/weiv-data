import type { WeivDataOptions, CollectionID, ReferencedItem, ReferringItem } from '@exweiv/weiv-data';
import { connectionHandler } from '../Helpers/connection_helpers';
import { validateParams } from '../Helpers/validator';
import { Document } from 'mongodb';

export async function insertReference(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        const { safeReferencedItemIds, safeReferringItemId, safeOptions } = await validateParams<"insertReference">(
            { collectionId, propertyName, referringItem, referencedItem, options },
            ["collectionId", "propertyName", "referringItem", "referencedItem"],
            "insertReference"
        );

        const { suppressAuth, readConcern } = safeOptions || {};
        const references = safeReferencedItemIds;
        const itemId = safeReferringItemId;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { acknowledged, modifiedCount } = await collection.updateOne(
            { _id: itemId },
            { $push: { [propertyName]: { $each: references } } as Document, $set: { _updatedDate: new Date() } },
            { readConcern: readConcern ? readConcern : "local" }
        );

        if (!acknowledged || modifiedCount <= 0) {
            throw new Error(`acknowledged: ${acknowledged}, modifiedCount: ${modifiedCount}`);
        }
    } catch (err) {
        throw new Error(`Error when inserting a reference item into an item: ${err}`);
    }
}