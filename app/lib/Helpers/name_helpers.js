"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCollectionId = void 0;
const lodash_1 = require("lodash");
const log_helpers_1 = require("./log_helpers");
exports.splitCollectionId = (0, lodash_1.memoize)(splitCollectionIdMain);
function splitCollectionIdMain(collectionId) {
    if (!collectionId || typeof collectionId !== "string") {
        throw new Error(`CollectionID is Required with this syntax: <database>/<collection> and it must be a string!`);
    }
    const [dbName, collectionName] = collectionId.split('/');
    if (!dbName || !collectionName) {
        return { dbName: "ExWeiv", collectionName: dbName };
    }
    (0, log_helpers_1.logMessage)(`splitCollectionIdMain function is called and here is the result for collectionName: ${collectionName} and dbName: ${dbName}`, collectionId);
    return { dbName, collectionName };
}
