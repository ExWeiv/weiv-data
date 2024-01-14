import _ from 'lodash';
import { convertStringId } from './item_helpers';
import { ObjectId } from 'mongodb/mongodb';

export const getCurrentItemId = (referringItem: ReferringItem): ObjectId => {
    if (_.isString(referringItem)) {
        return convertStringId(referringItem);
    } else if (_.isObject(referringItem) && !_.isArray(referringItem)) {
        return convertStringId(referringItem._id);
    } else {
        throw Error(`WeivData - Wrong referringItem type`);
    }
}

export const getReferences = (referencedItem: ReferencedItem): ObjectId[] => {
    if (_.isString(referencedItem)) {
        // Single String (Converted ID)
        return [convertStringId(referencedItem)];
    } else if (_.isObject(referencedItem) && !_.isArray(referencedItem)) {
        // Single Object (Converted ID)
        return [convertStringId(referencedItem._id)];
    } else if (_.isObject(referencedItem) && _.isArray(referencedItem)) {
        if (_.every(referencedItem, (element) => _.isString(element))) {
            // Array of Strings (Converted to Array of IDs)
            return referencedItem.map((itemId) => {
                if (typeof itemId === "string") {
                    return convertStringId(itemId)
                } else {
                    return convertStringId(itemId._id);
                }
            })
        } else if (_.every(referencedItem, (element) => _.isObject(element))) {
            // Array of Objects (Converted to Array of IDs)
            return referencedItem.map((item) => {
                if (typeof item === "string") {
                    return convertStringId(item)
                } else {
                    return convertStringId(item._id);
                }
            });
        } else {
            throw Error(`WeivData - Wrong referencedItem type`);
        }
    } else {
        throw Error(`WeivData - Wrong referencedItem type`);
    }
}