import type { CollectionID, WeivDataOptions, ReferringItem, ReferencedItem } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { update } from './update';

export async function replaceReferences(collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptions): Promise<void> {
    try {
        // Validate incoming call by checking few basic things
        const { safeOptions, safeReferringItemId, safeReferencedItemIds } = await validateParams<"replaceReferences">(
            { collectionId, propertyName, referringItem, referencedItem, options },
            ["collectionId", "propertyName", "referringItem", "referencedItem"],
            "replaceReferences"
        );

        const updated = await update(collectionId, { _id: safeReferringItemId, [propertyName]: safeReferencedItemIds }, safeOptions);
        if (!updated) {
            throw new Error(`couldn't replace references: ${updated}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when replacing references, ${err}`);
    }
}