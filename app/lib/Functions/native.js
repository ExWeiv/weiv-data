"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.native = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
async function native(collectionId, suppressAuth) {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        return collection;
    }
    catch (err) {
        throw Error(`WeivData - Error when returning native collection cursor from mongodb driver: ${err}`);
    }
}
exports.native = native;
