"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCollectionId = void 0;
const lodash_1 = require("lodash");
exports.splitCollectionId = (0, lodash_1.memoize)(splitCollectionIdMain);
function splitCollectionIdMain(collectionId) {
    if (!collectionId) {
        throw Error(`WeivData - CollectionID is Required with this syntax: <database>/<collection>`);
    }
    const [dbName, collectionName] = collectionId.split('/');
    if (!dbName || !collectionName) {
        return { dbName: "ExWeiv", collectionName: dbName };
    }
    return { dbName, collectionName };
}
