import { ObjectId } from 'mongodb';

export function convertStringId(_id: string | ObjectId, create = false): ObjectId {
    if (!_id) {
        throw new Error(`_id doesn't exist and it's undefined!`);
    } else {
        if (typeof _id !== "string" && typeof _id !== "object") {
            throw new Error(`Invalid _id value type!, it must be a string or ObjectId`);
        }
    }

    if (ObjectId.isValid(_id)) {
        if (typeof _id === "string") {
            return new ObjectId(_id);
        } else if (typeof _id === "object") {
            return _id;
        } else {
            throw new Error(`Invalid ObjectID (converted from string or ObjectId but it's still invalid)`);
        }
    } else {
        if (create === true) {
            return new ObjectId();
        }
        throw new Error(`Invalid _id type for convertStringId method, itemIds should be string or ObjectId!`);
    }
}

export function convertObjectId(_id: ObjectId | string): string {
    if (_id) {
        // If it's a string directly return it
        if (typeof _id === "string") {
            return _id;
        }
        return _id.toHexString();
    } else {
        throw new Error(`WeivData - ObjectId -> String converter not working!`);
    }
}