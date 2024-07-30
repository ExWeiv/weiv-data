"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCollectionId = void 0;
const lodash_1 = require("lodash");
const error_manager_1 = require("../Errors/error_manager");
const weiv_data_config_1 = require("../Config/weiv_data_config");
exports.splitCollectionId = (0, lodash_1.memoize)(splitCollectionIdMain);
function splitCollectionIdMain(collectionId) {
    if (!collectionId || typeof collectionId !== "string") {
        (0, error_manager_1.kaptanLogar)("00007");
    }
    const [dbName, collectionName] = collectionId.split('/');
    const { defaultDatabaseName } = (0, weiv_data_config_1.getWeivDataConfigs)();
    if (!dbName || !collectionName) {
        return { dbName: defaultDatabaseName || "ExWeiv", collectionName: dbName };
    }
    return { dbName, collectionName };
}
