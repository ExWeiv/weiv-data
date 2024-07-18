import type { ReferringItem, ReferencedItem, Item, ItemID } from '@exweiv/weiv-data';
import { ObjectId } from 'mongodb';
import { copyOwnPropsOnly } from './validator';
import { isArray } from 'lodash';
import { kaptanLogar } from '../Errors/error_manager';
import { convertIdToObjectId } from '../Functions/id_converters';

export const getReferenceItemId = (referringItem: ReferringItem): ObjectId => {
    if (referringItem) {
        let safeReferringItem: ReferringItem;

        if (ObjectId.isValid(referringItem as any)) {
            if (typeof referringItem === "string") {
                return new ObjectId(referringItem);
            } else if (typeof referringItem === "object") {
                return referringItem as ObjectId;
            } else {
                kaptanLogar("00013", "ItemID is not a string or ObjectID so we can't convert it to ObjectID in any way");
            }
        } else {
            if (typeof referringItem === "object") {
                if (!(referringItem as Item)._id) {
                    kaptanLogar("00013", "when sending Item it must contain _id field in it with a valid value!");
                }
                safeReferringItem = copyOwnPropsOnly<Item>(referringItem);
                return convertIdToObjectId(safeReferringItem._id);
            } else {
                if (typeof referringItem !== "string") {
                    kaptanLogar("00013", "ItemID must be ObjectId or StringId! It cannot be something else!");
                }
                return convertIdToObjectId(referringItem);
            }
        }
    } else {
        kaptanLogar("00013", "RefferingItem is empty there is no value!");
    }
}

export const getReferencesItemIds = (referencedItem: ReferencedItem): ObjectId[] => {
    if (referencedItem) {
        let saveObjectIds: ObjectId[] = [];
        if (isArray(referencedItem)) {
            for (const i of (referencedItem as Item[] | ItemID[])) {
                saveObjectIds.push(getReferenceItemId(i));
            }
            return saveObjectIds;
        } else {
            saveObjectIds.push(getReferenceItemId(referencedItem));
            return saveObjectIds;
        }
    } else {
        kaptanLogar("00013", "ReferencedItem is empty there is no value!");
    }
}