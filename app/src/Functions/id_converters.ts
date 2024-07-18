import { ObjectId } from "mongodb";
import { convertToStringId } from "../Helpers/internal_id_converter";
import { kaptanLogar } from "../Errors/error_manager";

export function convertIdToString(id: string | ObjectId, encoding?: "base64" | "hex",): string {
    try {
        return convertToStringId(id, encoding);
    } catch (err) {
        kaptanLogar("00010", `${err}`);
    }
}

export function convertIdToObjectId(id: string | ObjectId): ObjectId {
    try {
        if (id instanceof ObjectId) {
            return id;
        } else {
            return new ObjectId(id);
        }
    } catch (err) {
        kaptanLogar("00010", `${err}`);
    }
}