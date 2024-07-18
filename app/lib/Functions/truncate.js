"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = truncate;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
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
            (0, error_manager_1.kaptanLogar)("00016", `couldn't remove all items in the collection, acknowledged: ${acknowledged}`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `removing all items in a collection (truncate): ${err}`);
    }
}
