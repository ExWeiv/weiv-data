"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDocumentIDs = convertDocumentIDs;
exports.recursivelyConvertIds = recursivelyConvertIds;
exports.convertToStringId = convertToStringId;
const mongodb_1 = require("mongodb");
function convertDocumentIDs(doc, returnType = "String") {
    if (Array.isArray(doc)) {
        for (let i = 0; i < doc.length; i++) {
            convertDocumentIDs(doc[i], returnType);
        }
    }
    else if (doc !== null && typeof doc === 'object') {
        for (const key in doc) {
            if (doc.hasOwnProperty(key)) {
                if (key === '_id') {
                    if (returnType === 'String' && doc[key] instanceof mongodb_1.ObjectId) {
                        doc[key] = doc[key].toString();
                    }
                    else if (returnType === 'ObjectID' && typeof doc[key] === 'string') {
                        doc[key] = new mongodb_1.ObjectId(doc[key]);
                    }
                }
                else {
                    convertDocumentIDs(doc[key], returnType);
                }
            }
        }
    }
    return doc;
}
function recursivelyConvertIds(docs) {
    docs.forEach(doc => convertDocumentIDs(doc));
    return docs;
}
function convertToStringId(id, encoding) {
    if (id instanceof mongodb_1.ObjectId) {
        return id.toString(encoding);
    }
    return id;
}
