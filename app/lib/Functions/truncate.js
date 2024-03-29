"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
async function truncate(collectionId, options) {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }
        const { suppressAuth } = options || {};
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged } = await collection.deleteMany({});
        if (acknowledged) {
            return true;
        }
        else {
            throw Error(`WeivData - Error when removing all items in a collection (truncate), acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw Error(`WeivData - Error when removing all items in a collection (truncate): ${err}`);
    }
}
exports.truncate = truncate;
