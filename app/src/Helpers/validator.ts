import type {
    CollectionID,
    Item,
    WeivDataOptions,
    ReferencedItem,
    ReferringItem,
    ItemID,
    WeivDataOptionsCache,
    WeivDataQueryReferencedOptions
} from "@exweiv/weiv-data";
import { type CreateCollectionOptions, ObjectId, type DropCollectionOptions, type ListCollectionsOptions, type Document, RenameOptions } from "mongodb";
import { getReferencesItemIds, getReferenceItemId } from "./reference_helpers";
import { convertStringId } from "./item_helpers";
import { isArray } from "lodash";

type FName = 'update' | 'truncate' | 'save' | 'replaceReferences' | 'replace' | 'removeReference' |
    'remove' | 'push' | 'pull' | 'native' | 'multiply' | 'isReferenced' | 'insertReference' | 'insert' | 'increment' |
    'get' | 'bulkUpdate' | 'bulkSave' | 'bulkRemove' | 'bulkInsert' | 'queryReferenced' | 'findOne' | 'getAndRemove' |
    'getAndReplace' | 'getAndUpdate' | 'createCollection' | 'deleteCollection' | 'listCollections' | 'renameCollection';

type ValidateParameters<FName> =
    FName extends 'update' ? { collectionId: CollectionID, item: Item, options?: WeivDataOptions } :
    FName extends 'truncate' ? { collectionId: CollectionID, options?: WeivDataOptions } :
    FName extends 'save' ? { collectionId: CollectionID, item: Item, options?: WeivDataOptions } :
    FName extends 'replaceReferences' ? { collectionId: CollectionID, options?: WeivDataOptions, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem } :
    FName extends 'replace' ? { collectionId: CollectionID, item: Item, options?: WeivDataOptions } :
    FName extends 'removeReference' ? { collectionId: CollectionID, options?: WeivDataOptions, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem } :
    FName extends 'remove' ? { collectionId: CollectionID, options?: WeivDataOptions, itemId: ItemID } :
    FName extends 'push' ? { collectionId: CollectionID, options?: WeivDataOptions, itemId: ItemID, propertyName: string, value: any } :
    FName extends 'pull' ? { collectionId: CollectionID, options?: WeivDataOptions, itemId: ItemID, propertyName: string, value: any } :
    FName extends 'native' ? { collectionId: CollectionID } :
    FName extends 'multiply' ? { collectionId: CollectionID, options?: WeivDataOptions, itemId: ItemID, propertyName: string, value: number } :
    FName extends 'isReferenced' ? { collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptionsCache } :
    FName extends 'insertReference' ? { collectionId: CollectionID, propertyName: string, referringItem: ReferringItem, referencedItem: ReferencedItem, options?: WeivDataOptionsCache } :
    FName extends 'insert' ? { collectionId: CollectionID, item: Item, options?: WeivDataOptionsCache } :
    FName extends 'increment' ? { collectionId: CollectionID, itemId: ItemID, propertyName: string, value: number, options?: WeivDataOptions } :
    FName extends 'get' ? { collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsCache } :
    FName extends 'bulkUpdate' ? { collectionId: CollectionID, items: Item[], options?: WeivDataOptions } :
    FName extends 'bulkSave' ? { collectionId: CollectionID, items: Item[], options?: WeivDataOptions } :
    FName extends 'bulkRemove' ? { collectionId: CollectionID, itemIds: ItemID[], options?: WeivDataOptions } :
    FName extends 'bulkInsert' ? { collectionId: CollectionID, items: Item[], options?: WeivDataOptions } :
    FName extends 'queryReferenced' ? { collectionId: CollectionID, targetCollectionId: string, itemId: ItemID, propertyName: string, queryOptions: WeivDataQueryReferencedOptions, options?: WeivDataOptions } :
    FName extends 'findOne' ? { collectionId: CollectionID, propertyName: string, value: any, options?: WeivDataOptionsCache } :
    FName extends 'getAndRemove' ? { collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptions } :
    FName extends 'getAndReplace' ? { collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptions } :
    FName extends 'getAndUpdate' ? { collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptions } :
    FName extends 'createCollection' ? { collectionId: CollectionID, options?: WeivDataOptions, collectionOptions?: CreateCollectionOptions } :
    FName extends 'deleteCollection' ? { collectionId: CollectionID, options?: WeivDataOptions, collectionOptions?: DropCollectionOptions } :
    FName extends 'listCollections' ? { databaseName: string, options?: WeivDataOptions, collectionFilter?: Document, collectionOptions?: ListCollectionsOptions } :
    FName extends 'renameCollection' ? { collectionId: CollectionID, newCollectionName: string, options?: WeivDataOptions, collectionOptions?: RenameOptions } :
    { [key: string]: any };

type ValidateResponse<FName> =
    FName extends 'update' ? { safeItem: Item, safeOptions?: WeivDataOptions } :
    FName extends 'truncate' ? { safeOptions?: WeivDataOptions } :
    FName extends 'save' ? { safeItem: Item, safeOptions?: WeivDataOptions } :
    FName extends 'replaceReferences' ? { safeOptions?: WeivDataOptions, safeReferringItemId: ObjectId, safeReferencedItemIds: ObjectId[] } :
    FName extends 'replace' ? { safeItem: Item, safeOptions?: WeivDataOptions } :
    FName extends 'removeReference' ? { safeOptions?: WeivDataOptions, safeReferringItemId: ObjectId, safeReferencedItemIds: ObjectId[] } :
    FName extends 'remove' ? { safeOptions?: WeivDataOptions, safeItemId: ObjectId } :
    FName extends 'push' ? { safeOptions?: WeivDataOptions, safeValue: any } :
    FName extends 'pull' ? { safeOptions?: WeivDataOptions, safeValue: any } :
    FName extends 'native' ? {} :
    FName extends 'multiply' ? { safeOptions?: WeivDataOptions } :
    FName extends 'isReferenced' ? { safeOptions?: WeivDataOptionsCache, safeReferringItemId: ObjectId, safeReferencedItemIds: ObjectId[] } :
    FName extends 'insertReference' ? { safeOptions?: WeivDataOptionsCache, safeReferringItemId: ObjectId, safeReferencedItemIds: ObjectId[] } :
    FName extends 'insert' ? { safeOptions?: WeivDataOptions, safeItem: Item } :
    FName extends 'increment' ? { safeOptions?: WeivDataOptions } :
    FName extends 'get' ? { safeOptions?: WeivDataOptionsCache, safeItemId: ObjectId } :
    FName extends 'bulkUpdate' ? { safeOptions?: WeivDataOptions, safeItems: Item[] } :
    FName extends 'bulkSave' ? { safeOptions?: WeivDataOptions, safeItems: Item[] } :
    FName extends 'bulkRemove' ? { safeOptions?: WeivDataOptions, safeItemIds: ObjectId[] } :
    FName extends 'bulkInsert' ? { safeOptions?: WeivDataOptions, safeItems: Item[] } :
    FName extends 'queryReferenced' ? { safeOptions?: WeivDataOptionsCache, safeItemId: ObjectId, safeQueryOptions: WeivDataQueryReferencedOptions } :
    FName extends 'findOne' ? { safeOptions?: WeivDataOptionsCache, safeValue: any } :
    FName extends 'getAndRemove' ? { safeOptions?: WeivDataOptions, safeItemId: ObjectId } :
    FName extends 'getAndReplace' ? { safeOptions?: WeivDataOptions, safeItemId: ObjectId, safeValue: Item } :
    FName extends 'getAndUpdate' ? { safeOptions?: WeivDataOptions, safeItemId: ObjectId, safeValue: Item } :
    FName extends 'createCollection' ? { safeOptions?: WeivDataOptions, safeCollectionOptions?: CreateCollectionOptions } :
    FName extends 'deleteCollection' ? { safeOptions?: WeivDataOptions, safeCollectionOptions?: DropCollectionOptions } :
    FName extends 'listCollections' ? { safeOptions?: WeivDataOptions, safeCollectionOptions?: ListCollectionsOptions, safeCollectionFilter?: Document } :
    FName extends 'renameCollection' ? { safeOptions?: WeivDataOptions, safeCollectionOptions?: ListCollectionsOptions } :
    object;

export async function validateParams<T>(params: ValidateParameters<T>, requiredParams: string[], func: FName): Promise<ValidateResponse<T>> {
    try {
        let safeItem: Item | undefined;
        let safeOptions: WeivDataOptions | WeivDataOptionsCache | undefined;
        let safeReferringItemId: ObjectId | undefined;
        let safeReferencedItemIds: ObjectId[] | undefined;
        let safeItemId: ObjectId | undefined;
        let safeValue: any | undefined;
        let safeItems: Item[] | undefined;
        let safeItemIds: ObjectId[] | undefined;
        let safeQueryOptions: WeivDataQueryReferencedOptions | undefined;
        let safeCollectionOptions: CreateCollectionOptions | undefined;
        let safeCollectionFilter: Document | undefined;

        const keys = Object.entries(params);
        for (const [key, value] of keys) {
            switch (key) {
                case "collectionId": {
                    // Check CollectionID Specific Details
                    if (value) {
                        if (typeof value !== "string") {
                            throw new Error(`type of collectionId is not string!`);
                        }
                    }
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
                }
                case "referringItem": {
                    // If no errors thrown then everything is okay!
                    safeReferringItemId = getReferenceItemId(value as ReferringItem);
                }
                case "referencedItem": {
                    // If no errors thrown then everything is okay!
                    safeReferencedItemIds = getReferencesItemIds(value as ReferencedItem);
                }
                case "propertyName": {
                    if (value) {
                        if (typeof value !== "string") {
                            throw new Error(`propertyName must be string!`);
                        }
                    }
                }
                case "itemId": {
                    if (value) {
                        if (ObjectId.isValid(value as ItemID)) {
                            safeItemId = value as ObjectId;
                        } else {
                            if (typeof value !== "string") {
                                throw new Error(`itemId must be string if not ObjectId`);
                            }

                            safeItemId = convertStringId(value);
                        }
                    }
                }
                case "value": {
                    if (value && typeof value === "object") {
                        safeValue = copyOwnPropsOnly(value);
                    }
                }
                case 'safeItems': {
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
                }
                case 'itemIds': {
                    if (value) {
                        if (isArray(value)) {
                            safeItemIds = value.map((itemId) => {
                                if (ObjectId.isValid(itemId)) {
                                    return itemId;
                                } else {
                                    if (typeof itemId !== "string") {
                                        throw new Error(`itemId must be string if not ObjectId`);
                                    }
                                    return convertStringId(itemId);
                                }
                            });
                        } else {
                            throw new Error(`itemIds must be an array`);
                        }
                    }
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

export function copyOwnPropsOnly(src: { [key: string | number]: any }): object {
    const result = Object.create(null);
    for (const key of Object.getOwnPropertyNames(src)) {
        if (key !== "__proto__") {
            result[key] = src[key];
        }
    }
    return result;
}