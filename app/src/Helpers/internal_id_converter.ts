import { Document, ObjectId } from 'mongodb';

// Convert single document's all _id fields into string from ObjectId.
export function convertDocumentIDs(doc: Document, returnType: 'String' | 'ObjectID' = "String"): Document {
    if (Array.isArray(doc)) {
        // If the document is an array, recursively process each element.
        for (let i = 0; i < doc.length; i++) {
            convertDocumentIDs(doc[i], returnType);
        }
    } else if (doc !== null && typeof doc === 'object') {
        // If the document is an object, iterate over its properties.
        for (const key in doc) {
            if (doc.hasOwnProperty(key)) {
                if (key === '_id') {
                    if (returnType === 'String' && doc[key] instanceof ObjectId) {
                        // Convert ObjectId to string.
                        doc[key] = doc[key].toString();
                    } else if (returnType === 'ObjectID' && typeof doc[key] === 'string') {
                        // Convert string to ObjectId.
                        doc[key] = new ObjectId(doc[key]);
                    }
                } else {
                    // Recursively process nested objects and arrays.
                    convertDocumentIDs(doc[key], returnType);
                }
            }
        }
    }

    return doc;
}

// Convert all _id fields into string. Including sub arrays and more.
export function recursivelyConvertIds(docs: Document[]) {
    docs.forEach(doc => convertDocumentIDs(doc));
    return docs;
}

// Convert ObjectID to String Version
export function convertToStringId(id: string | ObjectId, encoding?: "hex" | "base64"): string {
    if (id instanceof ObjectId) {
        return id.toString(encoding);
    }

    return id;
}