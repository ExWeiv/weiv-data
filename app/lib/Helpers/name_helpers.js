"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCollectionId = void 0;
const lodash_1 = require("lodash");
const error_manager_1 = require("../Errors/error_manager");
exports.splitCollectionId = (0, lodash_1.memoize)(splitCollectionIdMain);
function splitCollectionIdMain(collectionId) {
    if (!collectionId || typeof collectionId !== "string") {
        (0, error_manager_1.kaptanLogar)("00007");
    }
    const [dbName, collectionName] = collectionId.split('/');
    if (!dbName || !collectionName) {
        return { dbName: "ExWeiv", collectionName: dbName };
    }
    return { dbName, collectionName };
}
