"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
async function truncate(collectionId, options) {
    try {
        const { safeOptions } = await (0, validator_1.validateParams)({ collectionId, options }, ["collectionId"], "truncate");
        const { suppressAuth } = safeOptions || {};
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { acknowledged } = await collection.deleteMany({});
        if (acknowledged) {
            return true;
        }
        else {
            throw new Error(`couldn't remove all items in the collection, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        throw new Error(`WeivData - Error when removing all items in a collection (truncate): ${err}`);
    }
}
exports.truncate = truncate;
