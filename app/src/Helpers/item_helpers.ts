import { ObjectId } from 'mongodb';

export function convertStringId(_id: string | ObjectId): ObjectId {
    if (typeof _id === "string") {
        return new ObjectId(_id);
    } else {
        return _id;
    }
}