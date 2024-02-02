import { Collection, MongoClient, ObjectId, Document, InferIdType } from 'mongodb/mongodb';
import { WeivDataQuery } from './src/DataQuery/data_query';

/**
 * Dynamic Collection ID <database_name>/<collection_name>. Our system will split both names and use them when needed.
 * 
 * @public
 */
export declare type CollectionID = string;

/**
 * An item from a collection is actually a JS object.
 * 
 * @public
 */
export declare type Item = Document;

/**
 * Item id can be string or ObjectID, inside the library it's in ObjectId type in most cases but in your code it can be one of them.
 * Don't worry you can always use string versions of ObjectIds weiv-data will convert them to ObjectId if needed.
 * 
 * (We use ObjectId type to get better performance in MongoDB)
 * 
 * @public
 */
export declare type ItemID = string | ObjectId;

/**
 * An array of ItemIDs these item ids can be string or ObjectId.
 * If you use string weiv-data will convert it to ObjectID.
 * 
 * @public
 */
export declare type ItemIDs = Array<ItemID>;

/**
 * Items basically array of objects/item.
 * 
 * @public
 */
export declare type Items = Array<Item>;

/**
 * When you want to bypass any permission check set this to `true`. This will use AdminURI instead of current user's URI.
 * 
 * @public
 */
export declare type SuppressAuth = boolean;

/**
 * When you want to bypass any hooks set this to `true` in this way all hooks will be bypassed.
 * 
 * @public
 */
export declare type SuppressHooks = boolean;

/**
 * When you want to get the most up to date data from servers set this to `true`. Library will set `readConcern` property to "majority".
 * In this way the data you will get will be the one that's most up to date.
 * 
 * @public
 */
export declare type ConsistentRead = boolean;

/**
 * When you want to close the MongoDB connection after the operation you make you can set this to true.
 * This will use the MongoDB's driver feature which is `close()` function to close the current connection to cluster.
 * 
 * (Note: when you close a connection you will save some resources but next call will take much more longer to complete
 * we do not recommend using this unless you know what you are doing).
 * 
 * @public
 */
export declare type CleanupAfter = boolean;

/**
 * When you want to get not just only members or admins id (member id in Wix) also visitors id enable this and system will create a data using wixData and then it will use the _owner field to get the current user temp id.
 * Note: This will slow down the operation and not recommended always so do not use it when you don't need it. Carefully design your database systems/models and your apps workflows because you shouldn't need this in most cases.
 * 
 * @public
 */
export declare type EnableVisitorID = boolean;

/**
 * An object containing options to use when processing an operation in weiv-data.
 * 
 * @public
 */
export declare type WeivDataOptions = {
    suppressAuth?: SuppressAuth,
    suppressHooks: ?SuppressHooks,
    consistentRead?: ConsistentRead,
    cleanupAfter?: CleanupAfter,
    enableVisitorId?: EnableVisitorID
}

/**
 * Referring item can be the item itself that contains the _id key or directly the item id.
 * 
 * @public
 */
export declare type ReferringItem = Item | ItemID;

/**
 * Referenced item can be the item itself that contains the _id key or directly the item id.
 * There can be more than one referenced item and if so you can put the values we defined above in an array.
 * So it can also be Array<Item> or Array<ItemID>
 * 
 * @public
 */
export declare type ReferencedItem = Item | ItemID | Items | ItemIDs;

/**
 * Provides functionality for performing aggregations on collection data.
 * 
 * @public
 */
export declare interface WeivDataAggregateI {
    /**
     * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in ascending order.
     * 
     * @param propertyName The properties used in the sort.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation.
     */
    ascending(propertyName: string): WeivDataAggregateI;

    /**
     * Refines a `WeivDataAggregateI` to only contain the average value from each aggregation group.
     * 
     * @param propertyName The property in which to find the average valu
     * @param projectedName The name of the property in the aggregation results containing the average value.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation.
     */
    avg(propertyName: string, projectedName?: string): WeivDataAggregateI;

    /**
     * Refines a `WeivDataAggregateI` to contain the item count of each group in the aggregation.
     * 
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation.
     */
    count(): WeivDataAggregateI;

    /**
     * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in descending order.
     * 
     * @param propertyName The properties used in the sort.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation.
     */
    descending(propertyName: string): WeivDataAggregateI;

    /**
     * Filters out items from being used in an aggregation.
     * 
     * @param filter The filter to use to filter out items from being used in the aggregation.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation.
     */
    filter(filter: WeivDataFilterI): WeivDataAggregateI;

    /**
     * Groups items together in an aggregation.
     * 
     * @param propertyName The property or properties to group on.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation.
     */
    group(propertyName: string): WeivDataAggregateI;

    /**
     * Filters out groups from being returned from an aggregation.
     * 
     * @param filter The filter to use to filter out groups from being returned from the aggregation.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation.
     */
    having(filter: WeivDataFilterI): WeivDataAggregateI;

    /**
     * Limits the number of items or groups the aggregation returns.
     * 
     * @param limit The number of items or groups to return.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation.
     */
    limit(limit: number): WeivDataAggregateI;

    /**
     * Refines a `WeivDataAggregateI` to only contain the maximum value from each aggregation group.
     * 
     * @param propertyName The property in which to find the maximum value.
     * @param projectedName The name of the property in the aggregation results containing the maximum value.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation. 
     */
    max(propertyName: string, projectedName?: string): WeivDataAggregateI;

    /**
     * Refines a `WeivDataAggregateI` to only contain the minimum value from each aggregation group.
     * 
     * @param propertyName The property in which to find the minimum value.
     * @param projectedName The name of the property in the aggregation results containing the minimum value.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation. 
     */
    min(propertyName: string, projectedName?: string): WeivDataAggregateI;

    /**
     * Sets the number of items or groups to skip before returning aggregation results.
     * 
     * @param skip The number of items or groups to skip in the aggregation results before returning the results.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation. 
     */
    skip(skip: number): WeivDataAggregateI;

    /**
     * Refines a `WeivDataAggregateI` to contain the sum from each aggregation group.
     * 
     * @param propertyName The property in which to find the sum.
     * @param projectedName The name of the property in the aggregation results containing the sum.
     * @returns {WeivDataAggregateI} A `WeivDataAggregateI` object representing the refined aggregation. 
     */
    sum(propertyName: string, projectedName?: string): WeivDataAggregateI;

    /**
     * Runs the aggregation and returns the results.
     * 
     * @param options Options to use when running an aggregation.
     * @returns {WeivDataAggregateResultI} Fulfilled - A Promise that resolves to the results of the aggregation. Rejected - Error that caused the aggregation to fail.
     */
    run(options?: AggregateRunOptions): WeivDataAggregateResultI;
}

/**
 * The results of an aggregation, containing the aggregated values.
 * 
 * @public
 */
export declare interface WeivDataAggregateResultI {
    /**
     * Gets the aggregated values.
     * 
     * @readonly
     */
    items: Items;

    /**
     * Returns the number of values in the aggregate results.
     * 
     * @readonly
     */
    length: number;

    /**
     * Indicates if the aggregation has more results.
     */
    hasNext(): boolean;

    /**
     * Retrieves the next page of aggregate results.
     * 
     * @param cleanupAfter Set connection cleaning. (Defaults to false.)
     * @returns {WeivDataAggregateResultI} Fulfilled - An aggregate object with the next page of aggregate results. Rejected - The errors that caused the rejection.
     */
    next(cleanupAfter?: CleanupAfter): Promise<WeivDataAggregateResultI>;
}

/**
 * Provides functionality for refining a filter.
 * 
 * @public
 */
export declare interface WeivDataFilterI {
    /**
     * Adds an `and` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as an `and` condition.
     * @return {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    and(query: WeivDataQueryI): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value is within a specified range.
     * 
     * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
     * @param rangeStart The beginning value of the range to match against.
     * @param rangeEnd The ending value of the range to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    between(propertyName: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value contains a specified string.
     * 
     * @param propertyName 
     * @param string 
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    contains(propertyName: string, string: string): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value ends with a specified string.
     * 
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the end of the specified property value.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    endsWith(propertyName: string, string: string): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value equals the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    eq(propertyName: string, value: any): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    ge(propertyName: string, value: string | number | Date): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value is greater than the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    gt(propertyName: string, value: string | number | Date): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property values equals all of the specified `value` parameters.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    hasAll(propertyName: string, value: string | number | Date | Array<any>): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    hasSome(propertyName: string, value: string | number | Date | Array<any>): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property does not exist or does not have any value.
     * 
     * @param propertyName The the property in which to check for a value.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    isEmpty(propertyName: string): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property has any value.
     * 
     * @param propertyName The property in which to check for a value.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    isNotEmpty(propertyName: string): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    le(propertyName: string, value: string | number | Date): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value is less than the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    lt(propertyName: string, value: string | number | Date): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value does not equal the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    ne(propertyName: string, value: any): WeivDataQueryI;

    /**
     * Adds a `not` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as a `not` condition.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    not(query: WeivDataQueryI): WeivDataQueryI;

    /**
     * Adds an `or` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as an `or` condition.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    or(query: WeivDataQueryI): WeivDataQueryI;

    /**
     * Refines a query or filter to match items whose specified property value starts with a specified string.
     * 
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the beginning of the specified property value.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    startsWith(propertyName: string, string: string): WeivDataQueryI;
}

/**
 * Contains functionality for refining a data query.
 * 
 * @public
 */
export declare interface WeivDataQueryI extends WeivDataFilterI {
    /**
     * Adds a sort to a query or sort, sorting by the specified properties in ascending order.
     * 
     * @param propertyName The properties used in the sort.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    ascending(propertyName: string): WeivDataQueryI;

    /**
     * Returns the number of items that match the query.
     * 
     * @param options An object containing options to use when processing this operation.
     * @returns {Promise<number>} Fulfilled - The number of items that match the query. Rejected - The errors that caused the rejection.
     */
    count(options?: WeivDataOptions): Promise<number>;

    /**
     * Adds a sort to a query or sort, sorting by the specified properties in descending order.
     * 
     * @param propertyName The properties used in the sort.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    descending(propertyName: string): WeivDataQueryI;

    /**
     * Returns the distinct values that match the query, without duplicates.
     * 
     * @param propertyName The property whose value will be compared for distinct values.
     * @param options An object containing options to use when processing this operation.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    distinct(propertyName: string, options?: WeivDataOptions): WeivDataQueryI;

    /**
     * Lists the fields to return in a query's results.
     * 
     * @param propertyName Properties to return. To return multiple properties, pass properties as additional arguments.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    fields(...propertyName: string[]): WeivDataQueryI;

    /**
     * Returns the items that match the query.
     * 
     * @param options An object containing options to use when processing this operation.
     * @returns {Promise<WeivDataQueryResultI>} Fulfilled - A Promise that resolves to the results of the query. Rejected - Error that caused the query to fail.
     */
    find(options: WeivDataOptions): Promise<WeivDataQueryResultI>;

    /**
     * Includes referenced items for the specified properties in a query's results.
     * 
     * @param propertyName The properties for which to include referenced items.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    include(...propertyName: string[]): WeivDataQueryI;

    /**
     * Limits the number of items the query returns.
     * 
     * @param limit The number of items to return, which is also the `pageSize` of the results object.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    limit(limit: number): WeivDataQueryI;

    /**
     * Sets the number of items to skip before returning query results.
     * 
     * @param skip The number of items to skip in the query results before returning the results.
     * @returns {WeivDataQueryI} A `WeivDataQueryI` object representing the refined query.
     */
    skip(skip: number): WeivDataQueryI;
}

/**
 * The results of a data reference query, containing the retrieved items.
 * 
 * @public
 */
export declare interface WeivDataQueryReferencedResultI {
    /**
     * Returns the items that match the reference query.
     * @readonly
     */
    items: Items;

    /**
     * Returns the total number of items that match the reference query.
     * @readonly
     */
    totalCount: number;

    /**
     * Indicates if the reference query has more results.
     */
    hasNext(): boolean;

    /**
     * Indicates if the reference query has previous results.
     */
    hasPrev(): boolean;

    /**
     * Retrieves the next page of reference query results.
     * 
     * @param cleanupAfter Set connection cleaning. (Defaults to false.)
     * @returns {Promise<WeivDataQueryReferencedResultI>} Fulfilled - A reference query result object with the next page of query results. Rejected - The errors that caused the rejection.
     */
    next(cleanupAfter?: CleanupAfter): Promise<WeivDataQueryReferencedResultI>;

    /**
     * Retrieves the previous page of reference query results.
     * 
     * @param cleanupAfter Set connection cleaning. (Defaults to false.)
     * @returns {Promise<WeivDataQueryReferencedResultI>} Fulfilled - A query result object with the previous page of query results. Rejected - The errors that caused the rejection.
     */
    prev(cleanupAfter?: CleanupAfter): Promise<WeivDataQueryReferencedResultI>;
}

/**
 * The results of a data query, containing the retrieved items.
 * 
 * @public
 */
export declare interface WeivDataQueryResultI {
    /**
     * Returns the index of the current results page number.
     * @readonly
     */
    currentPage: number;

    /**
     * Returns the items that match the query.
     * @readonly
     */
    items: Items;

    /**
     * Returns the number of items in the current results page.
     * @readonly
     */
    length: number;

    /**
     * Returns the query page size.
     * @readonly
     */
    pageSize: number;

    /**
     * Returns the total number of items that match the query.
     * @readonly
     */
    totalCount: number;

    /**
     * Returns the total number of pages the query produced.
     * @readonly
     */
    totalPages: number;

    /**
     * Indicates if the query has more results.
     * @returns {boolean}
     */
    hasNext(): boolean;

    /**
     * Indicates the query has previous results.
     * @returns {boolean}
     */
    hasPrev(): boolean;

    /**
     * Retrieves the next page of query results.
     * 
     * @param cleanupAfter Set connection cleaning. (Defaults to false.)
     * @returns {Promise<WeivDataQueryResultI>} Fulfilled - A query result object with the next page of query results. Rejected - The errors that caused the rejection.
     */
    next(cleanupAfter?: CleanupAfter): Promise<WeivDataQueryResultI>;

    /**
     * Retrieves the previous page of query results.
     * 
     * @param cleanupAfter Set connection cleaning. (Defaults to false.)
     * @returns {Promise<WeivDataQueryResultI>} Fulfilled - A query result object with the previous page of query results. Rejected - The errors that caused the rejection.
     */
    prev(cleanupAfter?: CleanupAfter): Promise<WeivDataQueryResultI>;
}

/**
 * Options to use when running an aggregation.
 * 
 * @public
 */
export declare type AggregateRunOptions = {
    suppressAuth?: SuppressAuth,
    consistentRead?: ConsistentRead,
    cleanupAfter?: CleanupAfter
}

/**
 * Adds a number of items to a collection.
 * 
 * @public
 */
export declare type BulkInsertResult = {
    insertedItems: DataItemValues[],
    insertedItemIds: {
        [key: number]: ObjectId;
    },
    inserted: number
}

//---------------------------------------------//
//              Internal Types                 //
//---------------------------------------------//

/** @internal */
export declare type CachedMongoClients = { [uri: string]: MongoClient };

/** @internal */
export declare type ConnectionCleanup = () => Promise<void> | void;

/** @internal */
export declare type CachedURI = string | undefined;

/** @internal */
export declare type CachedRole = string | undefined;

/** @internal */
export declare type MemberID = string;

/** @internal */
export declare type DbName = string;

/** @internal */
export declare type CollectionName = string;

/** @internal */
export declare type GeneralObject = { [key: string]: any };

/** @internal */
export declare type HookName = 'afterCount' | 'afterGet' | 'afterInsert' | 'afterQuery' | 'afterRemove' | 'afterUpdate' | 'beforeCount' | 'beforeGet' | 'beforeInsert' | 'beforeQuery' | 'beforeRemove' | 'beforeUpdate';

/** @internal */
export declare type SetupClientResult = {
    connection: MongoClient,
    cleanup: ConnectionCleanup
}

/** @internal */
export declare type UseClientResult = {
    pool: MongoClient,
    cleanup: ConnectionCleanup,
    memberId?: MemberID
}

/** @internal */
export declare type GetMongoURIResult = {
    uri: URI,
    memberId?: MemberID
}

/** @internal */
export declare type HookArgs<HookName> =
    HookName extends 'beforeGet' ? [item: string | ObjectId, context: HookContext] :
    HookName extends 'afterGet' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'beforeCount' ? [item: WeivDataQuery, context: HookContext] :
    HookName extends 'afterCount' ? [item: number, context: HookContext] :
    HookName extends 'beforeInsert' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'afterInsert' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'beforeQuery' ? [item: WeivDataQuery, context: HookContext] :
    HookName extends 'afterQuery' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'beforeRemove' ? [item: string | ObjectId, context: HookContext] :
    HookName extends 'beforeUpdate' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'afterUpdate' ? [item: GeneralObject, context: HookContext] :
    [item: any, context: HookContext];

/** @internal */
export declare type HooksResult<HookName> =
    HookName extends 'beforeGet' ? string | ObjectId :
    HookName extends 'afterGet' ? GeneralObject :
    HookName extends 'beforeCount' ? WeivDataQuery :
    HookName extends 'afterCount' ? number :
    HookName extends 'beforeInsert' ? GeneralObject :
    HookName extends 'beforeQuery' ? WeivDataQuery :
    HookName extends 'afterQuery' ? GeneralObject :
    HookName extends 'beforeRemove' ? string | ObjectId :
    HookName extends 'afterUpdate' ? GeneralObject :
    GeneralObject;

/** @internal */
export declare type ConnectionHandlerResult = {
    collection: Collection,
    cleanup: ConnectionCleanup,
    memberId?: MemberID
}

/** @internal */
export declare type HookContextResult = {
    dbName: DbName;
    collectionName: CollectionName;
    userId: MemberID | null;
    userRoles: Array;
}

/** @internal */
export declare type PipelineArray = Document[];

/** @internal */
export declare type PipelineGroupObject<T> = {
    _id?: T;
    [key?: string]: any;
    $group?: object;
};

/** @internal */
export declare type SortingObject = {
    propertyName: string;
    type: 1 | -1;
}
/** @internal */
export declare type HavingFilter = {
    $match: object;
};

/** @internal */
export declare type QueryFilters = {
    [key: string]: object | string | number
}

/** @internal */
export declare type QuerySort = {
    [key: string]: 1 | -1;
}

/** @internal */
export declare type QueryFields = {
    [key: string]: 1
}

/** @internal */
export declare type LookupObject = {
    from: string,
    localField: string,
    foreignField: string,
    as: string,
    pipeline: { $limit: number }[]
}

/** @internal */
export declare type ReferenceLenghtObject = {
    [key: string]: {
        $cond: {
            if: { $isArray: string },
            then: { $size: string },
            else: 0
        }
    }
}

/** @internal */
export declare type QueryResultQueryOptions = {
    query: DataQueryFilters,
    distinctProperty?: string,
    skip?: number,
    sort?: DataQuerySort,
    fields?: DataQueryFields,
    includes: { $lookup?: LookupObject, $unwind?: string }[],
    addFields: ReferenceLenghtObject
}

/** @internal */
export declare type DataQueryResultOptions = {
    suppressAuth?: SuppressAuth,
    consistentRead?: ConsistentRead,
    pageSize: number,
    dbName: DbName,
    collectionName: CollectionName,
    queryClass: GeneralObject,
    queryOptions: QueryResultQueryOptions,
    collection: Collection
}

/** @internal */
export declare type IncludeObject = {
    collectionName: string,
    fieldName: string,
    foreignField?: string,
    as?: string
    type?: "single" | "multi" | "mixed",
    maxItems?: number,
    countItems?: boolean
}

/** @internal */
export declare type WeivDataQueryReferencedOptions = { pageSize: number, order: 'asc' | 'desc' };