import { Document, MongoClient, Collection } from 'mongodb/mongodb';

/** 
 * When it's set to `true` system will use AdminURI to perform operations so even if user is a visitor system will use Admin permissions.
 * 
 * @public */
export declare type SuppressAuth = boolean | undefined;

/** 
 * When it's set to `true` hooks won't run before or after the operation.
 * 
 * @public */
export declare type SuppressHooks = boolean | undefined;

/** 
 * When it's enabled (set to `true`) system will create a data using wixData APIs and get the ID from auto-generated _owner field if the user is in visitor role and not in Admin or Member role.
 * This will slow down the function a bit and will use your wixData limits.
 * 
 * @public */
export declare type EnableVisitorID = boolean | undefined;

/** 
 * When it's `true` it's setting `readConcern` as "majority" so the data recieved will be up to date in most servers.
 * It can be useful when you want to get a data just after it's updated.
 * 
 * @public */
export declare type ConsistentRead = boolean | undefined;

/** 
 * Cleans the connection after operation. (Uses `.close()` function of MongoDB). It's not recommended to use in most cases but maybe you need it.
 * 
 * @public */
export declare type CleanupAfter = boolean | undefined;

/** 
 * Options to use when running an aggregation.
 * 
 * @public */
export declare type RunOptions = {
    suppressAuth: SuppressAuth,
    consistentRead: ConsistentRead,
    cleanupAfter: CleanupAfter
}

/** 
 * The results of an aggregation, containing the aggregated values.
 * 
 * @public */
export declare type AggregateResult = {
    items: Document[],
    length: number,
    hasNext: () => boolean,
    next: (cleanupAfter?: CleanupAfter) => Promise<AggregateResult>
}

/** 
 * The results of an aggregation, containing the aggregated values.
 * 
 * @public */
export declare type DataQueryOptions = {
    suppressAuth: SuppressAuth,
    suppressHooks: SuppressHooks,
    consistentRead: ConsistentRead,
    cleanupAfter: CleanupAfter
}

/** 
 * The results of a data query, containing the retrieved items.
 * 
 * @public */
export declare type QueryResult = {
    currentPage: number,
    items: Document[],
    length: number,
    pageSize: number,
    query: GeneralObject,
    totalCount: number,
    totalPages: number,
    hasNext: () => boolean,
    hasPrev: () => boolean,
    next: (cleanupAfter?: CleanupAfter) => Promise<QueryResult>,
    prev: (cleanupAfter?: CleanupAfter) => Promise<QueryResult>
}

// Internal Use Types
/** @internal */
export declare type CachedMongoClients = { [uri: string]: MongoClient };

/** @internal */
export declare type ConnectionCleanup = () => Promise<void> | void;

/** @internal */
export declare type ClientFunctionsReturns = {
    connection: MongoClient,
    cleanup: ConnectionCleanup
}

/** @internal */
export declare type MemberID = string;

/** @internal */
export declare type URI = string;

/** @internal */
export declare type CachedURI = URI | undefined;

/** @internal */
export declare type CachedRole = string | undefined;

/** @internal */
export declare type UseClientReturns = {
    pool: MongoClient,
    cleanup: ConnectionCleanup,
    memberId?: MemberID
}

/** @internal */
export declare type MongoURIReturns = {
    uri: URI,
    memberId?: MemberID
}

/** @internal */
export declare type GeneralObject = { [key: string]: any };

/** @internal */
export declare type HookName = 'afterCount' | 'afterGet' | 'afterInsert' | 'afterQuery' | 'afterRemove' | 'afterUpdate' | 'beforeCount' | 'beforeGet' | 'beforeInsert' | 'beforeQuery' | 'beforeRemove' | 'beforeUpdate';

/** @internal */
export declare type HookArgs<HookName> =
    HookName extends 'beforeGet' ? [item: string | ObjectId, context: HookContext] :
    HookName extends 'afterGet' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'beforeCount' ? [item: DataQuery, context: HookContext] :
    HookName extends 'afterCount' ? [item: number, context: HookContext] :
    HookName extends 'beforeInsert' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'afterInsert' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'beforeQuery' ? [item: DataQuery, context: HookContext] :
    HookName extends 'afterQuery' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'beforeRemove' ? [item: string | ObjectId, context: HookContext] :
    HookName extends 'beforeUpdate' ? [item: GeneralObject, context: HookContext] :
    HookName extends 'afterUpdate' ? [item: GeneralObject, context: HookContext] :
    [item: any, context: HookContext];

/** @internal */
export declare type HooksReturns<HookName> =
    HookName extends 'beforeGet' ? string | ObjectId :
    HookName extends 'afterGet' ? GeneralObject :
    HookName extends 'beforeCount' ? DataQuery :
    HookName extends 'afterCount' ? number :
    HookName extends 'beforeInsert' ? GeneralObject :
    HookName extends 'beforeQuery' ? DataQuery :
    HookName extends 'afterQuery' ? GeneralObject :
    HookName extends 'beforeRemove' ? string | ObjectId :
    HookName extends 'afterUpdate' ? GeneralObject :
    GeneralObject;

/** @internal */
export declare type ConnectionHandlerReturns = {
    collection: Collection,
    cleanup: ConnectionCleanup,
    memberId?: MemberID
}

/** @internal */
export declare type CollectionID = string;

/** @internal */
export declare type DbName = string;

/** @internal */
export declare type CollectionName = string;

/** @internal */
export declare type CollectionID = string;

/** @internal */
export declare type PipelineArray = Document[];

/** @internal */
export declare type HookContextReturns = {
    dbName: DbName;
    collectionName: CollectionName;
    userId: MemberID | null;
    userRoles: Array;
}

/** @internal */
export declare type DataQueryResultOptions = {
    suppressAuth?: SuppressAuth,
    consistentRead?: ConsistentRead,
    suppressHooks?: SuppressHooks
    pageSize: number,
    dbName: DbName,
    collectionName: CollectionName,
    queryClass: GeneralObject,
    queryOptions: QueryResultQueryOptions,
    collection: Collection
}

/** @internal */
export declare type DataQueryFilters = {
    [key: string]: object | string | number
}

/** @internal */
export declare type DataQuerySort = {
    [key: string]: 1 | -1;
}

/** @internal */
export declare type DataQueryFields = {
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