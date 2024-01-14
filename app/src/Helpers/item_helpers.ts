import { ObjectId } from 'mongodb';

export function convertStringId(_id: string | ObjectId): ObjectId {
    if (typeof _id === "string") {
        return new ObjectId(_id);
    } else if (typeof _id === "object") {
        return _id;
    } else {
        throw Error(`WeivData - Wrong _id type!`);
    }
}