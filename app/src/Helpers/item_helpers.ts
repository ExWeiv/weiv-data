import { ObjectId } from 'mongodb';

export function convertStringId(_id: string | ObjectId | undefined, create = false): ObjectId {
    if (typeof _id === "string") {
        return new ObjectId(_id);
    } else if (typeof _id === "object") {
        return _id;
    } else {
        if (create === true) {
            return new ObjectId();
        }
        throw new Error(`wrong _id type for convertStringId!`);
    }
}