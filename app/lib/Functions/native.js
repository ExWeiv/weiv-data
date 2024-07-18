"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.native = native;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
async function native(collectionId, suppressAuth) {
    try {
        await (0, validator_1.validateParams)({ collectionId }, ["collectionId"], "native");
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        return collection;
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00018", `when returning native collection cursor from mongodb driver: ${err}`);
    }
}
