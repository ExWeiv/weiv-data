import { ObjectId } from "mongodb";
import { convertStringId } from "../Helpers/item_helpers";

/**
 * You can convert your string ids to ObjectId or ObjectIds to string ids with this helper function integrated to this library.
 * 
 * @param id ID you want to convert can be string or a valid ObjectId
 * @param stringMethod Optional converting method can be "base64" or "hex" defaults to "hex"
 * @returns ObjectId or string reverse of the input
 */
export function idConverter(id: string | ObjectId, stringMethod?: "base64" | "hex"): ObjectId | string {
    if (typeof id === "string") {
        return convertStringId(id);
    } else {
        return id.toString(stringMethod || "hex");
    }
}