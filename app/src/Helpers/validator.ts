import type {
    CollectionID,
    Item,
    WeivDataOptions,
    ReferencedItem,
    ReferringItem,
    ItemID,
    WeivDataOptionsCache,
    WeivDataQueryReferencedOptions,
    WeivDataOptionsWrite,
    WeivDataOptionsOwner,
    WeivDataOptionsWriteOwner
} from "@exweiv/weiv-data";
import { type CreateCollectionOptions, type DropCollectionOptions, type ListCollectionsOptions, type Document, RenameOptions, ObjectId } from "mongodb";
import { getReferencesItemIds, getReferenceItemId } from "./reference_helpers";
import { isArray } from "lodash";
import { convertIdToObjectId } from "../Functions/id_converters";

type FName = 'update' | 'truncate' | 'save' | 'replaceReferences' | 'replace' | 'removeReference' |
    'remove' | 'push' | 'pull' | 'native' | 'multiply' | 'isReferenced' | 'insertReference' | 'insert' | 'increment' |
    'get' | 'bulkUpdate' | 'bulkSave' | 'bulkRemove' | 'bulkInsert' | 'queryReferenced' | 'findOne' | 'getAndRemove' |
    'getAndReplace' | 'getAndUpdate' | 'createCollection' | 'deleteCollection' | 'listCollections' | 'renameCollection';

type ValidateParameters<FName> =
    FName extends 'update' ? { collectionId: CollectionID, item: Item, options?: WeivDataOptionsOwner } :
    FName extends 'truncate' ? { collectionId: CollectionID, options?: WeivDataOptions } :
    FName extends 'save' ? { collectionId: CollectionID, item: Item, options?: WeivDataOptionsWriteOwner } :
    FName extends 'replaceReferences' ? { collectionId: CollectionID, options?: WeivDataOptions, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem } :
    FName extends 'replace' ? { collectionId: CollectionID, item: Item, options?: WeivDataOptionsOwner } :
    FName extends 'removeReference' ? { collectionId: CollectionID, options?: WeivDataOptions, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem } :
    FName extends 'remove' ? { collectionId: CollectionID, options?: WeivDataOptionsOwner, itemId: ItemID } :
    FName extends 'push' ? { collectionId: CollectionID, options?: WeivDataOptions, itemId: ItemID, propertyName: string, value: any[] } :
    FName extends 'pull' ? { collectionId: CollectionID, options?: WeivDataOptions, itemId: ItemID, propertyName: string, value: any } :
    FName extends 'native' ? { collectionId: CollectionID } :
    FName extends 'multiply' ? { collectionId: CollectionID, options?: WeivDataOptions, itemId: ItemID, propertyName: string, value: number } :
    FName extends 'isReferenced' ? { collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptionsCache } :
    FName extends 'insertReference' ? { collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptionsCache } :
    FName extends 'insert' ? { collectionId: CollectionID, item: Item, options?: WeivDataOptionsWrite } :
    FName extends 'increment' ? { collectionId: CollectionID, itemId: ItemID, propertyName: string, value: number, options?: WeivDataOptions } :
    FName extends 'get' ? { collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsCache } :
    FName extends 'bulkUpdate' ? { collectionId: CollectionID, items: Item[], options?: WeivDataOptionsOwner } :
    FName extends 'bulkSave' ? { collectionId: CollectionID, items: Item[], options?: WeivDataOptionsWriteOwner } :
    FName extends 'bulkRemove' ? { collectionId: CollectionID, itemIds: ItemID[], options?: WeivDataOptionsOwner } :
    FName extends 'bulkInsert' ? { collectionId: CollectionID, items: Item[], options?: WeivDataOptionsWrite } :
    FName extends 'queryReferenced' ? { collectionId: CollectionID, targetCollectionId: string, itemId: ItemID, propertyName: string, queryOptions?: WeivDataQueryReferencedOptions, options?: WeivDataOptions } :
    FName extends 'findOne' ? { collectionId: CollectionID, propertyName: string, value: any, options?: WeivDataOptionsCache } :
    FName extends 'getAndRemove' ? { collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsOwner } :
    FName extends 'getAndReplace' ? { collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptionsOwner } :
    FName extends 'getAndUpdate' ? { collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptionsOwner } :
    FName extends 'createCollection' ? { collectionId: CollectionID, suppressAuth?: boolean, collectionOptions?: CreateCollectionOptions } :
    FName extends 'deleteCollection' ? { collectionId: CollectionID, suppressAuth?: boolean, collectionOptions?: DropCollectionOptions } :
    FName extends 'listCollections' ? { databaseName: string, suppressAuth?: boolean, collectionFilter?: Document, collectionOptions?: ListCollectionsOptions } :
    FName extends 'renameCollection' ? { collectionId: CollectionID, newCollectionName: string, suppressAuth?: boolean, collectionOptions?: RenameOptions } :
    { [key: string]: any };

type ValidateResponse<FName> =
    FName extends 'update' ? { safeItem: Item, safeOptions?: WeivDataOptionsOwner } :
    FName extends 'truncate' ? { safeOptions?: WeivDataOptions } :
    FName extends 'save' ? { safeItem: Item, safeOptions?: WeivDataOptionsWriteOwner } :
    FName extends 'replaceReferences' ? { safeOptions?: WeivDataOptions, safeReferringItemId: ObjectId, safeReferencedItemIds: ObjectId[] } :
    FName extends 'replace' ? { safeItem: Item, safeOptions?: WeivDataOptionsOwner } :
    FName extends 'removeReference' ? { safeOptions?: WeivDataOptions, safeReferringItemId: ObjectId, safeReferencedItemIds: ObjectId[] } :
    FName extends 'remove' ? { safeOptions?: WeivDataOptionsOwner, safeItemId: ObjectId } :
    FName extends 'push' ? { safeOptions?: WeivDataOptions, safeValue: any } :
    FName extends 'pull' ? { safeOptions?: WeivDataOptions, safeValue: any } :
    FName extends 'native' ? {} :
    FName extends 'multiply' ? { safeOptions?: WeivDataOptions } :
    FName extends 'isReferenced' ? { safeOptions?: WeivDataOptionsCache, safeReferringItemId: ObjectId, safeReferencedItemIds: ObjectId[] } :
    FName extends 'insertReference' ? { safeOptions?: WeivDataOptionsCache, safeReferringItemId: ObjectId, safeReferencedItemIds: ObjectId[] } :
    FName extends 'insert' ? { safeOptions?: WeivDataOptionsWrite, safeItem: Item } :
    FName extends 'increment' ? { safeOptions?: WeivDataOptions } :
    FName extends 'get' ? { safeOptions?: WeivDataOptionsCache, safeItemId: ObjectId } :
    FName extends 'bulkUpdate' ? { safeOptions?: WeivDataOptionsOwner, safeItems: Item[] } :
    FName extends 'bulkSave' ? { safeOptions?: WeivDataOptionsWriteOwner, safeItems: Item[] } :
    FName extends 'bulkRemove' ? { safeOptions?: WeivDataOptionsOwner, safeItemIds: ObjectId[] } :
    FName extends 'bulkInsert' ? { safeOptions?: WeivDataOptionsWrite, safeItems: Item[] } :
    FName extends 'queryReferenced' ? { safeOptions?: WeivDataOptionsCache, safeItemId: ObjectId, safeQueryOptions?: WeivDataQueryReferencedOptions } :
    FName extends 'findOne' ? { safeOptions?: WeivDataOptionsCache, safeValue: any } :
    FName extends 'getAndRemove' ? { safeOptions?: WeivDataOptionsOwner, safeItemId: ObjectId } :
    FName extends 'getAndReplace' ? { safeOptions?: WeivDataOptionsOwner, safeItemId: ObjectId, safeValue: Item } :
    FName extends 'getAndUpdate' ? { safeOptions?: WeivDataOptionsOwner, safeItemId: ObjectId, safeValue: Item } :
    FName extends 'createCollection' ? { safeCollectionOptions?: CreateCollectionOptions } :
    FName extends 'deleteCollection' ? { safeCollectionOptions?: DropCollectionOptions } :
    FName extends 'listCollections' ? { safeCollectionOptions?: ListCollectionsOptions, safeCollectionFilter?: Document } :
    FName extends 'renameCollection' ? { safeCollectionOptions?: ListCollectionsOptions } :
    object;

export async function validateParams<T>(params: ValidateParameters<T>, requiredParams: string[], func: FName): Promise<ValidateResponse<T>> {
    try {
        let safeItem: Item | undefined;
        let safeOptions: WeivDataOptions | WeivDataOptionsCache | CreateCollectionOptions | DropCollectionOptions | ListCollectionsOptions | WeivDataOptionsWrite | WeivDataOptionsOwner | WeivDataOptionsWriteOwner | undefined;
        let safeReferringItemId: ObjectId | undefined;
        let safeReferencedItemIds: ObjectId[] | undefined;
        let safeItemId: ObjectId | undefined;
        let safeValue: any | undefined;
        let safeItems: Item[] | undefined;
        let safeItemIds: ObjectId[] | undefined;
        let safeQueryOptions: WeivDataQueryReferencedOptions | undefined;
        let safeCollectionOptions: CreateCollectionOptions | undefined;
        let safeCollectionFilter: Document | undefined;

        const paramKeys = Object.entries(params);
        for (const [key, value] of paramKeys) {
            switch (key) {
                case "collectionId": {
                    // Check CollectionID Specific Details
                    if (value) {
                        if (typeof value !== "string") {
                            throw new Error(`type of collectionId is not string!`);
                        }
                    }
                    break;
                }
                case "item": {
                    // Check Item Specific Details
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of item is not object!`);
                        } else {
                            // Fix Prototype Pollution (Works on ES6 or higher only which Wix already supports)
                            safeItem = copyOwnPropsOnly(value);
                        }
                    }
                    break;
                }
                case "options": {
                    // Check Options Specific Details
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of options is not object!`);
                        } else {
                            // Fix Prototype Pollution (Works on ES6 or higher only which Wix already supports)
                            safeOptions = copyOwnPropsOnly(value);
                        }
                    }
                    break;
                }
                case "referringItem": {
                    // If no errors thrown then everything is okay!
                    safeReferringItemId = getReferenceItemId(value as ReferringItem);
                    break;
                }
                case "referencedItem": {
                    // If no errors thrown then everything is okay!
                    safeReferencedItemIds = getReferencesItemIds(value as ReferencedItem);
                    break;
                }
                case "propertyName": {
                    if (value) {
                        if (typeof value !== "string") {
                            throw new Error(`propertyName must be string!`);
                        }
                    }
                    break;
                }
                case "itemId": {
                    if (value) {
                        safeItemId = convertIdToObjectId(value as ObjectId);
                    }
                    break;
                }
                case "value": {
                    if (value && typeof value === "object" && isPlainObject(value)) {
                        safeValue = copyOwnPropsOnly(value);
                    } else {
                        safeValue = value;
                    }
                    break;
                }
                case 'items': {
                    if (value) {
                        if (isArray(value)) {
                            // Fix Prototype Pollution (Works on ES6 or higher only which Wix already supports)
                            safeItems = value.map((item) => {
                                return copyOwnPropsOnly(item);
                            });
                        } else {
                            throw new Error(`type of items is not array!`);
                        }
                    }
                    break;
                }
                case 'itemIds': {
                    if (value) {
                        if (isArray(value)) {
                            safeItemIds = value.map((itemId) => {
                                return convertIdToObjectId(itemId);
                            });
                        } else {
                            throw new Error(`itemIds must be an array`);
                        }
                    }
                    break;
                }
                case 'queryOptions': {
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of queryOptions is not object!`);
                        } else {
                            // Fix Prototype Pollution (Works on ES6 or higher only which Wix already supports)
                            safeQueryOptions = copyOwnPropsOnly(value) as WeivDataQueryReferencedOptions;
                        }
                    }
                    break;
                }
                case 'collectionOptions': {
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of collection action options is not object!`);
                        } else {
                            // Fix Prototype Pollution (Works on ES6 or higher only which Wix already supports)
                            safeCollectionOptions = copyOwnPropsOnly(value);
                        }
                    }
                    break;
                }
                case 'collectionFilter': {
                    if (value) {
                        if (typeof value !== "object") {
                            throw new Error(`type of collection filter is not object!`);
                        } else {
                            // Fix Prototype Pollution (Works on ES6 or higher only which Wix already supports)
                            safeCollectionFilter = copyOwnPropsOnly(value) as Document;
                        }
                    }
                    break;
                }
                case "suppressAuth": {
                    if (typeof value !== "boolean") {
                        throw new Error(`type of suppressAuth is not boolean!`);
                    }
                    break;
                }
                default: {
                    // do nothing
                    break;
                }
            }

            if (requiredParams.includes(key)) {
                if (!value || value === null || value === undefined) {
                    throw new Error(`${key} is required param for ${func} function!`);
                }
            }
        }

        // Check Specific Needs of each Function
        const functionList: FName[] = [
            "update",
            "replace",
            "bulkUpdate"
        ];

        if (functionList.includes(func)) {
            checkItemIds(params, func);
        }

        return {
            safeItem,
            safeOptions,
            safeReferencedItemIds,
            safeReferringItemId,
            safeItemId,
            safeValue,
            safeItems,
            safeItemIds,
            safeQueryOptions,
            safeCollectionOptions,
            safeCollectionFilter
        } as ValidateResponse<T>;
    } catch (err) {
        throw new Error(`Validation Error!, ${err}`);
    }
}

function checkItemIds(params: { [key: string]: any }, func: FName): null {
    try {
        const bulkFunctions: FName[] = [
            "bulkUpdate"
        ];

        if (bulkFunctions.includes(func)) {
            for (const item of params.items) {
                if (!item._id) {
                    throw new Error(`item must contain _id property, _id is missing from item object in items array!`);
                }
            }
        } else {
            if (!params.item._id) {
                throw new Error(`item must contain _id property, _id is missing from item object!`);
            }
        }
        return null;
    } catch (err) {
        throw new Error(`params doesn't contain item data (weiv-data internal error please report BUG)`);
    }
}

// Note: this function may create some problems and block some functions!!!
export function copyOwnPropsOnly<R extends Document>(src: R): R {
    try {
        const result = Object.create(null);

        function copyObject(value: any) {
            if (isPlainObject(value)) {
                return copyOwnPropsOnly(value); // Plain object, call recursively
            } else {
                return value; // Not a plain object, copy as-is
            }
        }

        for (const key of Object.getOwnPropertyNames(src)) {
            if (key !== "__proto__" || "constructor" || "prototype") {
                if (typeof src[key] === "object") {
                    result[key] = copyObject(src[key]);
                } else {
                    result[key] = src[key];
                }
            }
        }

        return result as R;
    } catch (err) {
        throw new Error(`copyOwnPropsOnly function failed! Details: ${err}`);
    }
}

// Helper function to check if a value is a plain object
function isPlainObject(value: any): boolean {
    if (typeof value !== 'object' || value === null) return false;
    if (Array.isArray(value)) return false; // exclude arrays
    return value.constructor === Object;
}