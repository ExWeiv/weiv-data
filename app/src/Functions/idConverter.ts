import { ObjectId } from "mongodb";
import { convertStringId } from "../Helpers/item_helpers";

export function idConverter(id: string | ObjectId, stringMethod?: "base64" | "hex"): ObjectId | string {
    try {
        if (typeof id === "string") {
            return convertStringId(id);
        } else {
            return id.toString(stringMethod || "hex");
        }
    } catch (err) {
        throw new Error(`WeivData - Error when converting an ID: ${err}`);
    }
}