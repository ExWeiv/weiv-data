import { Collection, ObjectId, Document } from 'mongodb/mongodb';

/**
 * Prevents permission checks from running for the operation. (Uses AdminURI by default). Defaults to undefined.
 * @public
 */
export type SuppressAuth = boolean;

/**
 * Prevents hooks from running for the operation. Defaults to undefined.
 * @public
 */
export type SuppressHooks = boolean;

/**
 * When true, `readConcern` overwritten as "majority". This decreases performance but ensures data retrieved is up to date even immediately after an update.
 * @public
 */
export type ConsistentRead = boolean;

/**
 * When you want to get not just only members or admins id (member id in Wix) also visitors id enable this and system will create a data using wix-data and then it will use the _owner field to get the current user temp id.
 * Note: This will slow down the operation and not recommended always so do not use it when you don't need it. Carefully design your database systems/models and your apps workflows because you shouldn't need this in most cases.
 * @public
 */
export type EnableVisitorID = boolean;

/**
 * Collection ID is <database>/<collection>
 * 
 * @example
 * ```js
 * 
 * const dbName = "ExWeiv"
 * const collectionName = "WeivData"
 * const collectionId = `${dbName}/${collectionName}`;
 * ```
 * 
 * @public */
export type CollectionID = string;

/**
 * An item from a collection is actually a JS object.
 * 
 * @public
 */
export type Item = Document;

/**
 * Item id can be string or ObjectID, inside the library it's in ObjectId type in most cases but in your code it can be one of them.
 * Don't worry you can always use string versions of ObjectIds weiv-data will convert them to ObjectId if needed.
 * 
 * (We use ObjectId type to get better performance in MongoDB)
 * 
 * @public
 */
export type ItemID = string | ObjectId;

/**
 * Items basically array of objects/item.
 * 
 * @public
 */
export type Items = Array<Item>;

/**
 * An array of ItemIDs these item ids can be string or ObjectId.
 * If you use string weiv-data will convert it to ObjectID.
 * 
 * @public
 */
export type ItemIDs = Array<ItemID>;

/**
 * An object containing options to use when processing an operation in weiv-data.
 * 
 * @public
 */
export interface WeivDataOptions {
    suppressAuth?: SuppressAuth,
    suppressHooks?: SuppressHooks,
    consistentRead?: ConsistentRead,
    enableVisitorId?: EnableVisitorID
}

//---------------------------------------------//
//              Internal Types                 //
//---------------------------------------------//

/** @internal */
export type ConnectionHandlerResult = {
    collection: Collection,
    memberId?: string
}