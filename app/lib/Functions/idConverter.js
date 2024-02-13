"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idConverter = void 0;
const item_helpers_1 = require("../Helpers/item_helpers");
/**
 * You can convert your string ids to ObjectId or ObjectIds to string ids with this helper function integrated to this library.
 *
 * @param id ID you want to convert can be string or a valid ObjectId
 * @param stringMethod Optional converting method can be "base64" or "hex" defaults to "hex"
 * @returns ObjectId or string reverse of the input
 */
function idConverter(id, stringMethod) {
    if (typeof id === "string") {
        return (0, item_helpers_1.convertStringId)(id);
    }
    else {
        return id.toString(stringMethod || "hex");
    }
}
exports.idConverter = idConverter;
