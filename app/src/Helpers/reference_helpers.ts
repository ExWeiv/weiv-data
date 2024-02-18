//@ts-nocheck
import type { Item, ItemID, Items, ItemIDs } from './collection';
import { convertStringId } from './item_helpers';
import type { ObjectId } from 'mongodb';

/**
 * Referring item can be the item itself that contains the _id key or directly the item id.
 * 
 * @public
 */
export type ReferringItem = Item | ItemID;

/**
 * Referenced item can be the item itself that contains the _id key or directly the item id.
 * There can be more than one referenced item and if so you can put the values we defined above in an array.
 * So it can also be Array<Item> or Array<ItemID>
 * 
 * @public
 */
export type ReferencedItem = Item | ItemID | Items | ItemIDs;

export const getCurrentItemId = (referringItem: ReferringItem): ObjectId => {
    if (typeof referringItem === 'object' && referringItem !== null && referringItem._id !== undefined && referringItem._id) {
        // Handle object cases:
        const id = referringItem._id;
        return convertStringId(id); // Use convertStringId to handle string or ObjectId
    } else if (typeof referringItem === 'string') {
        // Create ObjectId from string using convertStringId:
        return convertStringId(referringItem);
    } else if (ObjectId.isValid(referringItem)) {
        // Already an ObjectId, return it directly:
        return referringItem;
    } else {
        throw new Error('WeivData - Error: Invalid value type, expected object with _id, string, or ObjectId');
    }
}

export const getReferences = (referencedItem: ReferencedItem): ObjectId[] => {
    if (Array.isArray(referencedItem)) {
        // Handle arrays (Items or ItemIDs):
        return referencedItem.flatMap((itemOrId) => getReferences(itemOrId)); // Recursively handle elements
    } else if (typeof referencedItem === 'object' && referencedItem !== null && referencedItem._id !== undefined && referencedItem._id) {
        // Handle objects (Items):
        return [getReferences(referencedItem._id)]; // Extract, process, and wrap in an array
    } else {
        // Handle string or ObjectId (ItemID) using convertStringId:
        return [convertStringId(referencedItem)]; // Leverage the helper function for conversion
    }
}