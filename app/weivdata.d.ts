/**
 * WeivData is a package that's built top of native MongoDB NodeJS driver. This package provides similar/same APIs with wix-data to make it easier for Velo developers to find an external DB solution.
 */
declare module '@exweiv/weiv-data' {
    /**@internal */
    import { Collection, CollectionInfo, CreateCollectionOptions, Document, ListCollectionsOptions, MongoClientOptions, ObjectId, RenameOptions } from 'mongodb'; /**@internal */
    import { Options } from 'node-cache';

    /**
     * @description
     * An object to define some options when including other relational fields.
     */
    interface IncludeObject {
        /**
         * @description
         * Collection of referenced item/s (only collection name)
         */
        collectionName: string,

        /**
         * @description
         * Property/field name of referenced items in the current item.
         */
        fieldName: string,

        /**
         * @description
         * Foreign field name. Defaults to _id.
         */
        foreignField?: string,

        /**
         * @description
         * Custom return name for included items. Defaults to `fieldName`.
         */
        as?: string

        /**
         * @description
         * Maximum number of items to include. Defaults to 50.
         */
        maxItems?: number,

        /**
         * @description
         * Enable counting total items or not. Defaults to `false`.
         */
        countItems?: boolean

        /**
         * @description
         * By default all referenced items are sorted via _createdDate field in ascending order (1) but you can customize that stage too!
         */
        sort?: {
            [propertyName: string]: 1 | -1
        }
    }

    /**
     * @description
     * All cached data types.
     * 
     * - permissions (Cached Database Permissions/Users/Secrets)
     * - secrets (Cached Other Secrets)
     * - get (Cached get Function Results)
     * - isreferenced (Cached isReferenced Function Results)
     * - query (Cached query Function Results)
     * - helpersecrets (Cached Helper Secrets)
     * - connectionclients (Cached Connected MongoClients)
     * 
     * Using these within an array will filter which caches to flush.
     */
    type CacheSelections = "permissions" | "secrets" | "isreferenced" | "query" | "helpersecrets" | "connectionclients";

    /**
     * @description
     * CollectionID is a single string that shows both database name and collection name together:
     * 
     * > Default database name is ExWeiv, if you have a database named as ExWeiv you can directly use collection name.
     * 
     * Syntax: database/collection;
     * @example
     * const dbName = "ExWeiv"
     * const collectionName = "WeivData"
     * const collectionId = `${dbName}/${collectionName}`;
     */
    type CollectionID = string;

    /**
     * @description
     * In WeivData you can pass two different type of item ids.
     * 
     * 1. If you pass string version of an ObjectId, WeivData will convert it to ObjectId.
     * 2. If you pass an ObjectId WeivData will use that ObjectId directly.
     * 
     * But we always return string ids so you don't need to convert ObjectIds into string.
     * 
     * > ObjectId is the default _id type in MongoDB collections.
     */
    type ItemID = string | import('mongodb').ObjectId;

    /**
     * Items are basically objects. Most of the time they include an _id field.
     */
    interface Item { [key: string]: any }

    /**
     * @description
     * An option to choose a consistency level when reading data from MongoDB Clusters.
     */
    type ReadConcern = "local" | "majority" | "linearizable" | "available" | "snapshot";

    /**
     * An object that you pass as the `options` parameter that modifies how an operation is performed.
     */
    interface WeivDataOptions {
        /**
         * @description
         * An option to bypass permissions and perform operations in admin level.
         */
        suppressAuth?: boolean,

        /**
         * @description
         * An option to bypass all hooks (before or after hooks) that runs for the function.
         */
        suppressHooks?: boolean,

        /**
         * @description
         * An option to choose a consistency level when reading data from MongoDB Clusters.
         */
        readConcern?: "local" | "majority" | "linearizable" | "available" | "snapshot",

        /**
         * @description
         * 
         * When enabled we will convert all _id fields from ObjectId to String, if they are not in ObjectId type then we won't touch them. If not enabled we will return _id fields without modification.
         */
        convertIds?: boolean
    }

    /**
     * @description
     * An object that you pass as the `options` parameter that modifies how an operation is performed. Unlike `WeivDataOptions` this type has cache control over the action.
     */
    interface WeivDataOptionsCache extends WeivDataOptions {
        /**
         * @description
         * Enable or disable the cache for the current function.
         */
        enableCache?: boolean,

        /**
         * @description
         * Set a custom cache timeout to specify a time of expiration for cached data.
         * (Anything above 6 min won't work since Wix website containers don't live longer than 6min)
         */
        cacheTimeout?: number
    }

    /**
     * @description
     * WeivData options only for some write functions like insert. Where you can insert new data into collection.
     */
    interface WeivDataOptionsWrite extends WeivDataOptions {
        /**
         * @description
         * An option to use visitorId. This option will try to get the id of current user on the site.
         * Even if it's a visitor and if that same visitor signs up to your site your _owner field data will be the same with the member id in Wix Members.
         * *Created for new data inserts doesn't have any effect on read functions or update functions*
         * 
         * > When enabled, function will make another extra call so it will be slower, defaults to false.
         * > For members you don't need this option to be true, weivData always knows the member ids.
         **/
        enableVisitorId?: boolean,
    }

    /**
     * @description
     * WeivData options only for query function.
     */
    interface WeivDataOptionsQuery extends WeivDataOptions {
        /**
         * @description
         * By default this is true and you can disable it if you want, when it's disabled (false) we won't fetch the total count of the items.
         */
        omitTotalCount?: boolean
    }

    /**
     * @description
     * WeivData options where onlyOwner is possible.
     */
    interface WeivDataOptionsOwner extends WeivDataOptions {
        /**
         * @description
         * When sert to true WeivData will add another filter and check if _owner field of the item matches with current member id.
         * This will make it possible to take action only if current member is the owner of the data.
         */
        onlyOwner?: boolean
    }

    /**
     * @description
     * WeivData options where onlyOwner is possible with enableVisitorId.
     */
    interface WeivDataOptionsWriteOwner extends WeivDataOptionsWrite {
        /**
         * @description
         * When sert to true WeivData will add another filter and check if _owner field of the item matches with current member id.
         * This will make it possible to take action only if current member is the owner of the data.
         */
        onlyOwner?: boolean
    }

    /**
     * @description
     * Referring item can be the item itself that contains the _id key or directly the item id.
     */
    type ReferringItem = Item | ItemID;

    /**
     * @description
     * Referenced item can be the item itself that contains the _id key or directly the item id.
     * There can be more than one referenced item and if so you can put the values we defined above in an array.
     * So it can also be Array<Item> or Array<ItemID>
     */
    type ReferencedItem = Item | ItemID | Item[] | ItemID[];

    /**
     * @description
     * Expected aggregation stages for MongoDB
     */
    type PipelineStageKey = "$addFields" | "$bucket" | "$bucketAuto" | "$changeStream" | "$changeStreamSplitLargeEvent" | "$collStats" | "$count" | "$currentOp" |
        "$densify" | "$documents" | "$facet" | "$fill" | "$geoNear" | "$graphLookup" | "$group" | "$indexStats" | "$limit" | "$listLocalSessions" | "$listSampledQueries" |
        "$listSearchIndexes" | "$listSessions" | "$lookup" | "$match" | "$merge" | "$out" | "$planCacheStats" | "$project" | "$redact" | "$replaceRoot" | "$replaceWith" |
        "$sample" | "$search" | "$searchMeta" | "$set" | "$setWindowFields" | "$shardedDataDistribution" | "$skip" | "$sort" | "$sortByCount" | "$unionWith" | "$unset" | "$unwind" | "$vectorSearch";

    /**
     * @description
     * Possible pipeline stage object
     */
    type PipelineStage = { [K in PipelineStageKey]?: any };

    // HELPER TYPES FOR STRONG TYPE SAFETY
    // HELPER TYPES FOR STRONG TYPE SAFETY
    // HELPER TYPES FOR STRONG TYPE SAFETY
    // HELPER TYPES FOR STRONG TYPE SAFETY
    // HELPER TYPES FOR STRONG TYPE SAFETY

    /**@internal */
    namespace Internal {
        /**@internal */
        type GroupedID<T> = { [K in keyof T]: T[K] };

        /**@internal */
        type UpdatedCItemWithGroupedID<RCItem, GroupedFields extends keyof RCItem, CItem> = Omit<RCItem, '_id' | GroupedFields> & {
            _id: GroupedID<Pick<RCItem, GroupedFields>>;
        } & CItem;

        /**@internal */
        type UpdateCItem<C, K extends string, V> = C & { [P in K]: V };

        /**@internal */
        type CItemKeys<T> = Extract<keyof T, string>;

        /**@internal */
        type ProjectedName<P, K extends string, S extends string> = P extends undefined ? `${K}${S}` : P;

        /**@internal */
        type UpdateCItemIDToNull<C> = C extends { _id: string | ObjectId | undefined } ? { _id: null; } & Omit<C, "_id"> : C;
    }

    // STARTING OF THE ACTUAL FUNCTIONS
    // STARTING OF THE ACTUAL FUNCTIONS
    // STARTING OF THE ACTUAL FUNCTIONS
    // STARTING OF THE ACTUAL FUNCTIONS
    // STARTING OF THE ACTUAL FUNCTIONS

    /**
     * @description
     * Creates an aggregation.
     * 
     * @param collectionId The ID of the collection to run the aggregation on.
     * @returns An aggregation cursor.
     */
    function aggregate<CItem = Item>(collectionId: CollectionID): WeivDataAggregate<CItem, CItem>;

    /**
     * @description
     * Returned aggregation cursor of WeivData. Add filters, lookups (joins) and more when aggregating data. 
     * 
     * Welcome to `weivData.aggregate` function of weiv-data library. This feature/function allows you to perform calculations on your database collections data.
     * You can use aggregate with any collection! Read documentation to learn from examples.
     * 
     * *Note:* Unlike wix-data in weiv-data order of methods matters, if you put filter method at the begining of aggregation it'll first filter the documents and then pass to next stage, if you pass filter method
     * after grouping then it'll act like wix-data's having method and filter the results after grouping stage. There are some optimizations made about ordering for example .limit and .skip order doesn't matter
     * but it's always better to keep the methods order in a meaningful way so you can control the aggregation more and even optimize it with this control.
     * 
     * **You can also use .addStage method to add any type of stage to aggregation that mongodb driver allows in this way you can mix the default methods which works similar/same with wix-data and also native
     * methods that mongodb provides!**
     * 
     * @example
     * // Here is a quick example from our internal systems where we can calculate average CPU scores for each cluster location:
     * 
     * import weivData from '@exweiv/weiv-data';
     * 
     * const result = await weivData.aggreagte('ExWeiv/Istanbul').avg('cpuScore').run();
     * console.log(result);
     */
    interface WeivDataAggregate<CItem, ReservedCItem> {
        /**
         * @description
         * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in ascending order.
         * 
         * @param propertyName The properties used in the sort.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        ascending(propertyName: Internal.CItemKeys<CItem>): WeivDataAggregate<CItem, ReservedCItem>;

        /**
         * @description
         * Refines a `WeivDataAggregate` to only contain the average value from each aggregation group.
         * 
         * @param propertyName The property in which to find the average value.
         * @param projectedName The name of the property in the aggregation results containing the average value.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        avg<K extends Internal.CItemKeys<CItem>, P extends undefined | string = undefined>(propertyName: K, projectedName?: P): WeivDataAggregate<
            Pick<
                Internal.UpdateCItem<Internal.UpdateCItemIDToNull<CItem>, Internal.ProjectedName<P, K, "Avg">, number>,
                '_id' extends keyof Internal.UpdateCItemIDToNull<CItem> ? "_id" | Internal.ProjectedName<P, K, "Avg"> : Internal.ProjectedName<P, K, "Avg">
            >, ReservedCItem
        >;

        /**
         * @description
         * Refines a `WeivDataAggregate` to contain the item count of each group in the aggregation.
         * 
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        count(): WeivDataAggregate<Internal.UpdateCItem<CItem, "count", number>, ReservedCItem>;

        /**
         * @description
         * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in descending order.
         * 
         * @param propertyName The properties used in the sort.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        descending(propertyName: Internal.CItemKeys<CItem>): WeivDataAggregate<CItem, ReservedCItem>;

        /**
         * @description
         * Filters out items from being used in an aggregation.
         * 
         * @param filter The filter to use to filter out items from being used in the aggregation.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        filter(filter: WeivDataFilter<Internal.CItemKeys<CItem>>): WeivDataAggregate<CItem, ReservedCItem>;

        /**
         * @description
         * Groups items together in an aggregation.
         * 
         * @param propertyName The property or properties to group on.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        group<K extends Internal.CItemKeys<ReservedCItem>>(...propertyName: K[]): WeivDataAggregate<
            Internal.UpdatedCItemWithGroupedID<ReservedCItem, K, CItem>,
            ReservedCItem
        >;

        /**
         * @description
         * Limits the number of items or groups the aggregation returns.
         * 
         * @param limit The number of items or groups to return.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        limit(limit: number): WeivDataAggregate<CItem, ReservedCItem>;

        /**
         * @description
         * Refines a `WeivDataAggregate` to only contain the maximum value from each aggregation group.
         * 
         * @param propertyName The property in which to find the maximum value.
         * @param projectedName The name of the property in the aggregation results containing the maximum value.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        max<K extends Internal.CItemKeys<CItem>, P extends string | undefined = undefined>(propertyName: K, projectedName?: P): WeivDataAggregate<
            Pick<
                Internal.UpdateCItem<Internal.UpdateCItemIDToNull<CItem>, Internal.ProjectedName<P, K, "Max">, number>,
                '_id' extends keyof Internal.UpdateCItemIDToNull<CItem> ? "_id" | Internal.ProjectedName<P, K, "Max"> : Internal.ProjectedName<P, K, "Max">
            >,
            ReservedCItem
        >;

        /**
         * @description
         * Refines a `WeivDataAggregate` to only contain the minimum value from each aggregation group.
         * 
         * @param propertyName The property in which to find the minimum value.
         * @param projectedName The name of the property in the aggregation results containing the minimum value.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        min<K extends Internal.CItemKeys<CItem>, P extends string | undefined = undefined>(propertyName: K, projectedName?: P): WeivDataAggregate<
            Pick<
                Internal.UpdateCItem<Internal.UpdateCItemIDToNull<CItem>, Internal.ProjectedName<P, K, "Min">, number>,
                '_id' extends keyof Internal.UpdateCItemIDToNull<CItem> ? "_id" | Internal.ProjectedName<P, K, "Min"> : Internal.ProjectedName<P, K, "Min">
            >,
            ReservedCItem
        >;

        /**
         * @description
         * Runs the aggregation and returns the results.
         * 
         * @param options Options to use when running an aggregation.
         * @returns Fulfilled - A Promise that resolves to the results of the aggregation. Rejected - Error that caused the aggregation to fail.
         */
        run(options?: WeivDataAggregateRunOptions): Promise<WeivDataAggregateResult<CItem>>;

        /**
         * @description
         * Sets the number of items or groups to skip before returning aggregation results.
         * 
         * @param skip The number of items or groups to skip in the aggregation results before returning the results.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        skip(skip: number): WeivDataAggregate<CItem, ReservedCItem>;

        /**
         * @description
         * Refines a `WeivDataAggregate` to contain the sum from each aggregation group.
         * 
         * @param propertyName The property in which to find the sum.
         * @param projectedName The name of the property in the aggregation results containing the sum.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        sum<K extends Internal.CItemKeys<CItem>, P extends string | undefined = undefined>(propertyName: K, projectedName?: P): WeivDataAggregate<
            Pick<
                Internal.UpdateCItem<Internal.UpdateCItemIDToNull<CItem>, Internal.ProjectedName<P, K, "Sum">, number>,
                '_id' extends keyof Internal.UpdateCItemIDToNull<CItem> ? "_id" | Internal.ProjectedName<P, K, "Sum"> : Internal.ProjectedName<P, K, "Sum">
            >,
            ReservedCItem
        >;

        /**
         * @description
         * This method allows you to add one or more pipeline stages, and mix with other methods. Checkout MongoDB aggregation pipeline for more information.
         * 
         * @param pipelineStage 
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        stage<NewCItem = {}>(...stage: PipelineStage[]): WeivDataAggregate<NewCItem & CItem, ReservedCItem>;
    }

    interface WeivDataAggregateResult<CItem> {
        /**
         * @description
         * Gets the aggregated values.
         */
        readonly items: CItem[];

        /**
         * @description
         * Returns the number of values in the aggregate results.
         */
        readonly length: number;

        /**
         * @description
         * Indicates if the aggregation has more results.
         */
        hasNext(): boolean;

        /**
         * @description
         * Retrieves the next page of aggregate results.
         */
        next(): Promise<WeivDataAggregateResult<CItem>>;

        /**
         * @description
         * Returns the pipeline created when performing the aggregation.
         */
        readonly pipeline: Document;
    }

    type WeivDataAggregateRunOptions = {
        suppressAuth?: boolean,
        readConcern?: ReadConcern,
        convertIds?: boolean
    }

    /**
     * @description
     * Creates a filter to be used with aggregations and some other methods.
     * 
     * @returns A filter object.
     */
    function filter<CItem = Item>(): WeivDataFilter<CItem>;

    interface WeivDataFilter<CItem> {
        /**
         * @description
         * Adds an and condition to the query or filter.
         * 
         * @param query A query to add to the initial query as an and condition.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        and(query: WeivDataFilter<Internal.CItemKeys<CItem>>): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is within a specified range.
         * 
         * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
         * @param rangeStart The beginning value of the range to match against.
         * @param rangeEnd The ending value of the range to match against.
         * @param convertIds When enabled passed value will be converted to ObjectId from string. Defaults to false.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        between<K extends Internal.CItemKeys<CItem>>(propertyName: K, rangeStart: CItem[K], rangeEnd: CItem[K], convertIds?: boolean): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value contains a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for inside the specified property value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        contains(propertyName: Internal.CItemKeys<CItem>, string: string): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value ends with a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for at the end of the specified property value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        endsWith(propertyName: Internal.CItemKeys<CItem>, string: string): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value equals the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @param convertIds When enabled passed value will be converted to ObjectId from string. Defaults to false.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        eq<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K], convertIds?: boolean): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        ge<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is greater than the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        gt<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property values equals all of the specified value parameters.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The values to match against.
         * @param convertIds When enabled passed values will be converted to ObjectId from string. Defaults to false.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        hasAll<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K][], convertIds?: boolean): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The values to match against.
         * @param convertIds When enabled passed values will be converted to ObjectId from string. Defaults to false.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        hasSome<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K][], convertIds?: boolean): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property does not exist or does not have any value.
         * 
         * @param propertyName The the property in which to check for a value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        isEmpty(propertyName: Internal.CItemKeys<CItem>): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property has any value.
         * 
         * @param propertyName The property in which to check for a value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        isNotEmpty(propertyName: Internal.CItemKeys<CItem>): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        le<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is less than the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        lt<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value does not equal the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @param convertIds When enabled passed value will be converted to ObjectId from string. Defaults to false.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        ne<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K], convertIds?: boolean): WeivDataFilter<CItem>;

        /**
         * @description
         * Adds a `not` condition to the query or filter.
         * 
         * @param query A query to add to the initial query as a not condition.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        not(query: WeivDataFilter<CItem>): WeivDataFilter<CItem>;

        /**
         * @description
         * Adds an `or` condition to the query or filter.
         * 
         * @param query A query to add to the initial query as an `or` condition.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        or(query: WeivDataFilter<CItem>): WeivDataFilter<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value starts with a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for at the beginning of the specified property value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        startsWith(propertyName: Internal.CItemKeys<CItem>, string: string): WeivDataFilter<CItem>;
    }

    /**
     * @description
     * Creates a query for retrieving items from a database collection.
     * 
     * @param collectionId The ID of the collection to run the query on.
     * @returns A query object.
     */
    function query<CItem = Item>(collectionId: CollectionID): WeivDataQuery<CItem>;

    /**
     * @description
     * Welcome to `weivData.query` function of weiv-data library. This feature/function allows you to run queries on your database collections data.
     * You can use features such as sort and filter. And you can control the query. Read documentation and learn more about weivData.query.
     * 
     * @example
     * // Here is a quick example from our internal systems where we can get all Clusters that has more than 18K cpu score in Istanbul:
     * 
     * import weivData from '@exweiv/weiv-data';
     * 
     * const result = await weivData.query('ExWeiv/Clusters').eq('location', 'Istanbul').gt('cpuScores', 18000).find();
     * console.log(result);
     */
    interface WeivDataQuery<CItem> {
        /**
         * @description
         * Adds an and condition to the query or filter.
         * 
         * @param query A query to add to the initial query as an and condition.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        and(query: WeivDataQuery<CItem>): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is within a specified range.
         * 
         * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
         * @param rangeStart The beginning value of the range to match against.
         * @param rangeEnd The ending value of the range to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        between<K extends Internal.CItemKeys<CItem>>(propertyName: K, rangeStart: CItem[K], rangeEnd: CItem[K]): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value contains a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for inside the specified property value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        contains(propertyName: Internal.CItemKeys<CItem>, string: string): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value ends with a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for at the end of the specified property value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        endsWith(propertyName: Internal.CItemKeys<CItem>, string: string): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value equals the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        eq<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        ge<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is greater than the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        gt<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property values equals all of the specified value parameters.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The values to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        hasAll<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K][]): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The values to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        hasSome<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K][]): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property does not exist or does not have any value.
         * 
         * @param propertyName The the property in which to check for a value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        isEmpty(propertyName: Internal.CItemKeys<CItem>): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property has any value.
         * 
         * @param propertyName The property in which to check for a value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        isNotEmpty(propertyName: Internal.CItemKeys<CItem>): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        le<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is less than the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        lt<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value does not equal the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        ne<K extends Internal.CItemKeys<CItem>>(propertyName: K, value: CItem[K]): WeivDataQuery<CItem>;

        /**
         * @description
         * Adds a `not` condition to the query or filter.
         * 
         * @param query A query to add to the initial query as a not condition.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        not(query: WeivDataQuery<CItem>): WeivDataQuery<CItem>;

        /**
         * @description
         * Adds an `or` condition to the query or filter.
         * 
         * @param query A query to add to the initial query as an `or` condition.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        or(query: WeivDataQuery<CItem>): WeivDataQuery<CItem>;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value starts with a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for at the beginning of the specified property value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        startsWith(propertyName: Internal.CItemKeys<CItem>, string: string): WeivDataQuery<CItem>;

        /**
         * @description
         * Adds a sort to a query or sort, sorting by the specified properties in ascending order.
         * 
         * @param propertyName The properties used in the sort.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        ascending(...propertyName: Internal.CItemKeys<CItem>[]): WeivDataQuery<CItem>;

        /**
         * @description
         * Returns the number of items that match the query.
         * 
         * @param options An object containing options to use when processing this operation.
         * @returns Fulfilled - The number of items that match the query. Rejected - The errors that caused the rejection.
         */
        count(options?: WeivDataOptions): Promise<number>;

        /**
         * @description
         * Adds a sort to a query or sort, sorting by the specified properties in descending order.
         * 
         * @param propertyName The properties used in the sort.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        descending(...propertyName: Internal.CItemKeys<CItem>[]): WeivDataQuery<CItem>;

        /**
         * @description
         * Returns the distinct values that match the query, without duplicates.
         * 
         * @param propertyName The property whose value will be compared for distinct values.
         * @param options An object containing options to use when processing this operation.
         * @returns Fulfilled - A Promise that resolves to the results of the query. Rejected - Error that caused the query to fail.
         */
        distinct<K extends Internal.CItemKeys<CItem>>(propertyName: K, options?: WeivDataOptions): Promise<WeivDataQueryResult<CItem[K]>>;

        /**
         * @description
         * Lists the fields to return in a query's results.
         * 
         * @param propertyName Properties to return. To return multiple properties, pass properties as additional arguments.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        fields<K extends Internal.CItemKeys<CItem>>(...propertyName: K[]): WeivDataQuery<Pick<CItem, K>>;

        /**
         * @description
         * Returns the items that match the query.
         * 
         * @param options An object containing options to use when processing this operation.
         * @returns Fulfilled - A Promise that resolves to the results of the query. Rejected - Error that caused the query to fail.
         */
        find(options?: WeivDataOptionsQuery): Promise<WeivDataQueryResult<CItem>>;

        /**
         * @description
         * Includes referenced items for the specified properties in a query's results.
         * 
         * @param includes Array of objects that you want to include with details
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        include<NewCItem = {}>(...includes: IncludeObject[]): WeivDataQuery<CItem & NewCItem>;

        /**
         * @description
         * Limits the number of items the query returns.
         * 
         * @param limit The number of items to return, which is also the `pageSize` of the results object.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        limit(limit: number): WeivDataQuery<CItem>;

        /**
         * @description
         * Sets the number of items to skip before returning query results.
         * 
         * @param skip The number of items to skip in the query results before returning the results.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        skip(skip: number): WeivDataQuery<CItem>;
    }

    interface WeivDataQueryResult<CItem> {
        /**
         * @description
         * Returns the index of the current results page number.
         */
        readonly currentPage: number;

        /**
         * @description
         * Returns the items that match the query.
         */
        readonly items: CItem[];

        /**
         * @description
         * Returns the number of items in the current results page.
         */
        readonly length: number;

        /**
         * @description
         * Returns the query page size.
         */
        readonly pageSize: number;

        /**
         * @description
         * Returns the total number of items that match the query.
         */
        readonly totalCount: number;

        /**
         * @deprecated
         * @description
         * Returns the total number of pages the query produced. (will be deleted in v5 doesn't work correctly)
         */
        readonly totalPages: number;

        /**
         * @description
         * Filters applied to query.
         */
        readonly _filters: any;

        /**
         * @description
         * Pipeline of aggregation if used if not undefined.
         */
        readonly _pipeline?: PipelineStage[];

        /**
         * @description
         * Indicates if the query has more results.
         */
        hasNext(): boolean;

        /**
         * @description
         * Indicates the query has previous results.
         */
        hasPrev(): boolean;

        /**
         * @description
         * Retrieves the next page of query results.
         * 
         * @returns Fulfilled - A query result object with the next page of query results. Rejected - The errors that caused the rejection.
         */
        next(): Promise<WeivDataQueryResult<CItem>>;

        /**
         * @description
         * Retrieves the previous page of query results.
         * 
         * @returns Fulfilled - A query result object with the previous page of query results. Rejected - The errors that caused the rejection.
         */
        prev(): Promise<WeivDataQueryResult<CItem>>;
    }

    /**
     * @description
     * Adds a number of items to a collection.
     * 
     * @param collectionId The ID of the collection to add the items to.
     * @param items The items to add.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The results of the bulk insert. Rejected - The error that caused the rejection.
     */
    function bulkInsert<CItem = Item>(collectionId: CollectionID, items: CItem[], options?: WeivDataOptionsWrite): Promise<BulkInsertResult<CItem>>;

    type BulkInsertResult<CItem> = {
        /**
         * @description
         * Total number of inserted items.
         */
        inserted: number,

        /**
         * @description
         * Item ids as string objectId
         */
        insertedItemIds: ItemID[]

        /**
         * @description
         * Inserted items.
         */
        insertedItems: CItem[]
    }

    /**
     * @description
     * Removes a number of items from a collection.
     * 
     * @param collectionId The ID of the collection to remove the items from.
     * @param itemsIds IDs of the items to remove.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The results of the bulk remove. Rejected - The error that caused the rejection.
     */
    function bulkRemove<CItemID = ItemID>(collectionId: CollectionID, itemsIds: CItemID[], options?: WeivDataOptionsOwner): Promise<BulkRemoveResult<CItemID>>;

    type BulkRemoveResult<CItemID> = {
        /**
         * @description
         * Total number of removed items.
         */
        removed: number,

        /**
         * @description
         * Removed item ids as string objectId
         */
        removedItemIds: CItemID[]
    }

    /**
     * @description
     * Inserts or updates a number of items in a collection.
     * 
     * @param collectionId The ID of the collection to save the items to.
     * @param items The items to insert or update.
     * @param options An object containing options to use when processing this operation.
     */
    function bulkSave<CItem = Item>(collectionId: CollectionID, items: CItem[], options?: WeivDataOptionsWriteOwner): Promise<BulkSaveResult<CItem>>;

    type BulkSaveResult<CItem> = {
        /**
         * @description
         * Total number of inserted items.
         */
        inserted: number,

        /**
         * @description
         * Inserted item ids as string objectid
         */
        insertedItemIds: ItemID[],

        /**
         * @description
         * Updated items.
         */
        savedItems: CItem[],

        /**
         * @description
         * Total number of updated items.
         */
        updated: number
    }

    /**
     * @description
     * Updates a number of items in a collection.
     * 
     * @param collectionId The ID of the collection that contains the item to update.
     * @param items The items to update.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The results of the bulk save. Rejected - The error that caused the rejection.
     */
    function bulkUpdate<CItem = Item>(collectionId: CollectionID, items: CItem[], options?: WeivDataOptionsWriteOwner): Promise<BulkUpdateResult<CItem>>;

    type BulkUpdateResult<CItem> = {
        /**
         * @description
         * Total number of updated items.
         */
        updated: number,

        /**
         * @description
         * Updated items.
         */
        updatedItems: CItem[]
    }

    /**
     * @description
     * Creates a new collection inside of a selected database. (User must have createCollection permission inside MongoDB dashboard).
     * 
     * @param collectionId CollectionID (database/collection).
     * @param suppressAuth A boolean value to bypass permissions.
     * @param options Native options of MongoDB driver when creating a collection. [Read Here](https://mongodb.github.io/node-mongodb-native/6.6/interfaces/CreateCollectionOptions.html)
     */
    function createCollection(collectionId: CollectionID, suppressAuth?: boolean, options?: CreateCollectionOptions): Promise<void>;

    /**
     * @description
     * Deletes a collection inside of a selected database. (User must have dropCollection permission inside MongoDB dashboard).
     * 
     * @param collectionId CollectionID (database/collection).
     * @param suppressAuth A boolean value to bypass permissions.
     * @param options Native options of MongoDB driver when deleting a collection. [Read Here](https://mongodb.github.io/node-mongodb-native/6.6/interfaces/DropCollectionOptions.html)
     */
    function deleteCollection(collectionId: CollectionID, suppressAuth?: boolean, options?: CreateCollectionOptions): Promise<boolean>;

    /**
     * @description
     * You can use findOne to find a single item from your collections based on .eq filter for any field.
     * 
     * @param collectionId The ID of the collection to remove the item from.
     * @param propertyName Property to filter.
     * @param value Filter value (mathing value for .eq filter)
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Found item. Rejected - The error caused the rejection.
     */
    function findOne<CItem = Item>(collectionId: CollectionID, propertyName: Internal.CItemKeys<CItem>, value: any, options?: WeivDataOptionsCache): Promise<Item | undefined>;

    /**
     * @description
     * Use when you want to flush the caches internally. You can choose caches to flush or pass empty array to flush all of them.
     * 
     * @param filters Filter which cache to flush. Pass empty array to flush all of them.
     */
    function flushCache(filters?: CacheSelections[]): void;

    /**
     * @description
     * Retrieves an item from a collection.
     * 
     * @param collectionId The ID of the collection to retrieve the item from.
     * @param itemId The ID of the item to retrieve.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The retrieved item or null if not found. Rejected - The error that caused the rejection.
     */
    function get(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsCache): Promise<Item | null>;

    /**
     * @description
     * You can use getAndRemove to find an item by it's _id and remove it.
     * 
     * @param collectionId The ID of the collection to remove the item from.
     * @param itemId ItemID to filter the _id field when performing the operation.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Removed item. Rejected - The error caused the rejection.
     */
    function getAndRemove(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsOwner): Promise<Item | undefined>;

    /**
     * @description
     * You can use getAndReplace to find an item by it's _id and replace it with new data.
     * 
     * @param collectionId The ID of the collection to remove the item from.
     * @param itemId ItemID to filter the _id field when performing the operation.
     * @param value Item that contains new data.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Updated item. Rejected - The error caused the rejection.
     */
    function getAndReplace<CItem = Item>(collectionId: CollectionID, itemId: ItemID, value: CItem, options?: WeivDataOptionsOwner): Promise<CItem | undefined>;

    /**
     * @description
     * You can use getAndUpdate to find an item by it's _id and update it's content.
     * 
     * @param collectionId The ID of the collection to remove the item from.
     * @param itemId ItemID to filter the _id field when performing the operation.
     * @param value Item that contains new data.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Updated item. Rejected - The error caused the rejection.
     */
    function getAndUpdate<CItem = Item>(collectionId: CollectionID, itemId: ItemID, value: CItem, options?: WeivDataOptionsOwner): Promise<CItem | undefined>;

    /**
     * @description
     * This function converts an id to string if it's an ObjectId, if not it'll return the given input.
     * 
     * @param id ID you want to convert, it can be string or a valid ObjectId
     * @param encoding Optional converting method can be "base64" or "hex" defaults to "hex"
     * @returns Fulfilled - String version of the id.
     */
    function convertIdToString(id: ItemID, encoding?: "base64" | "hex"): string;

    /**
     * @description
     * This function converts an id to ObjectId if it's a string, if not it'll return the given input.
     * 
     * @param id ID you want to convert can be string or a valid ObjectId
     * @returns Fulfilled - ObjectId version of the id.
     */
    function convertIdToObjectId(id: ItemID): ObjectId;

    /**
     * @description
     * You can use increment function to increment the value of a filed in an item. (Negative values are possible too)
     * 
     * @param collectionId The ID of the collection to increment value.
     * @param itemId ItemID to filter the _id field when performing the operation.
     * @param propertyName Property name for the increment field.
     * @param value Increment current value by that much. (If you set it to 10 it will add +10)
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Updated item. Rejected - The error caused the rejection.
     */
    function increment<CItem = Item>(collectionId: CollectionID, itemId: ItemID, propertyName: Internal.CItemKeys<CItem>, value: number, options?: WeivDataOptions): Promise<CItem | null>;

    /**
     * @description
     * Adds an item to a collection.
     * 
     * @param collectionId The ID of the collection to add the item to.
     * @param item The item to add.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The item that was added. Rejected - The error that caused the rejection.
     */
    function insert<CItem = Item>(collectionId: CollectionID, item: CItem, options?: WeivDataOptionsWrite): Promise<CItem>;

    /**
     * @description
     * Inserts a reference in the specified property.
     * 
     * @param collectionId The ID of the collection that contains the referring item.
     * @param propertyName The property to insert the reference into.
     * @param referringItem The referring item or referring item's ID.
     * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
     * @param options An object containing options to use when processing this operation.
     */
    function insertReference(
        collectionId: CollectionID,
        propertyName: string,
        referringItem: ItemID | Item,
        referencedItem: Item | Item[] | ItemID | ItemID[],
        options?: WeivDataOptions): Promise<void>;

    /**
     * @description
     * Checks if a reference to the referenced item exists in the specified property of the referring item.
     * 
     * @param collectionId The ID of the collection that contains the referring item.
     * @param propertyName The property that possibly contains the references to the referenced item.
     * @param referringItem The referring item or referring item's ID.
     * @param referencedItem The referenced item or referenced item's ID.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Whether the referring item contains a reference to the referenced item or not. Rejected - The error that caused the rejection.
     */
    function isReferenced(
        collectionId: CollectionID,
        propertyName: string,
        referringItem: ItemID | Item,
        referencedItem: Item | Item[] | ItemID | ItemID[],
        options?: WeivDataOptionsCache): Promise<boolean>;

    /**
     * @description
     * Lists collections inside of a selected database. (User must have listCollections permission inside MongoDB dashboard).
     * 
     * @param databaseName Database name that you want to get the collections of.
     * @param suppressAuth An object containing options to use when processing this operation.
     * @param filter MongoDB native filtering options. [Read More](https://mongodb.github.io/node-mongodb-native/6.6/classes/Db.html#listCollections).
     * @param listOptions MongoDB native listCollections options. [Read More](https://mongodb.github.io/node-mongodb-native/6.6/classes/Db.html#listCollections).
     * @returns Fulfilled - Array of [CollectionInfo](https://mongodb.github.io/node-mongodb-native/6.6/interfaces/CollectionInfo.html).
     */
    function listCollections(databaseName: string, suppressAuth?: boolean, filter?: Document, listOptions?: ListCollectionsOptions): Promise<CollectionInfo[]>;

    /**
     * @description
     * You can use multiply function to multiply the value of a filed in an item.
     * 
     * @param collectionId The ID of the collection to multiply value.
     * @param itemId ItemID to filter the _id field when performing the operation.
     * @param propertyName Property name for the multiply field.
     * @param value Multiply current value by that much. (If you set it to 10 it will multiply it by 10 x*10)
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Updated item. Rejected - The error caused the rejection.
     */
    function multiply<CItem = Item>(collectionId: CollectionID, itemId: ItemID, propertyName: Internal.CItemKeys<CItem>, value: number, options?: WeivDataOptions): Promise<CItem | null>;

    /**
     * @description
     * Use native MongoDB syntax and perform any action you want inside a collection. This API can be very useful when you need something that doesn't exist in weiv-data library.
     * You don't need to manage clients, permissions etc. instead you will only write the actions you want to take.
     * 
     * Anything done with native collection cursor won't trigger any hooks. Handle hooks manually by handling them inside your code.
     * 
     * @param collectionId The ID of the collection to manage.
     * @param suppressAuth Set to false by default you can set to true if you want to bypass the permissions and run it as Admin.
     * @returns Fulfilled - Native MongoDB [Collection Cursor](https://mongodb.github.io/node-mongodb-native/6.6/classes/Collection.html).
     */
    function native(collectionId: CollectionID, suppressAuth?: boolean): Promise<Collection>;

    /**
     * @description
     * You can use pull function to pull values from an array field in an item. This function uses $pull operator to remove data from an array.
     * 
     * @param collectionId The ID of the collection to pull/remove the items from.
     * @param itemId ItemID to filter the _id field when performing the operation.
     * @param propertyName Property name for the array field.
     * @param value Values to pull from array.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Updated item. Rejected - The error caused the rejection.
     */
    function pull<CItem = Item>(collectionId: CollectionID, itemId: ItemID, propertyName: Internal.CItemKeys<CItem>, value: any, options?: WeivDataOptions): Promise<CItem | null>;

    /**
     * @description
     * You can use push function to push new values into an array field in an item. This function uses $push operator to remove data from an array.
     * 
     * @param collectionId The ID of the collection to push/add the items from.
     * @param itemId ItemID to filter the _id field when performing the operation.
     * @param propertyName Property name for the array field.
     * @param value Values to push into array.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - Updated item. Rejected - The error caused the rejection.
     */
    function push<CItem = Item>(collectionId: CollectionID, itemId: ItemID, propertyName: Internal.CItemKeys<CItem>, value: any, options?: WeivDataOptions): Promise<CItem | null>;

    /**
     * @description
     * Gets the full items referenced in the specified property.
     * 
     * @param collectionId The ID of the collection that contains the referring items.
     * @param targetCollectionId The ID of the collection that contains the referenced items.
     * @param itemId The referring item's ID.
     * @param propertyName The property that contains the references to the referenced items.
     * @param queryOptions An object containing options to use when querying referenced items.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The referenced items. Rejected - The error that caused the rejection.
     */
    function queryReferenced<CItem = Item>(
        collectionId: CollectionID,
        targetCollectionId: string,
        itemId: ItemID,
        propertyName: Internal.CItemKeys<CItem>,
        queryOptions: WeivDataQueryReferencedOptions,
        options?: WeivDataOptions): Promise<WeivDataQueryReferencedResult<CItem>>;

    type WeivDataQueryReferencedOptions = {
        /**
         * @description
         * Sort type of returned items. (Asc = ascending, desc = descending)
         */
        order: "asc" | "desc",

        /**
         * @description
         * Page size for query.
         */
        pageSize: number
    }

    interface WeivDataQueryReferencedResult<CItem> {
        /**
         * @description
         * Returns the items that match the reference query.
         */
        items: CItem[];

        /**
         * @description
         * Returns the total number of items that match the reference query.
         */
        readonly totalCount: number;

        /**
         * @description
         * Indicates if the reference query has more results.
         */
        hasNext(): boolean;

        /**
         * @description
         * Indicates if the reference query has previous results.
         */
        hasPrev(): boolean;

        /**
         * @description
         * Retrieves the next page of reference query results.
         * 
         * @returns Fulfilled - A reference query result object with the next page of query results. Rejected - The errors that caused the rejection.
         */
        next(): Promise<WeivDataQueryReferencedResult<CItem>>;

        /**
         * @description
         * Retrieves the previous page of reference query results.
         * 
         * @returns Fulfilled - A query result object with the previous page of query results. Rejected - The errors that caused the rejection.
         */
        prev(): Promise<WeivDataQueryReferencedResult<CItem>>;
    }

    /**
     * @description
     * Removes an item from a collection.
     * 
     * @param collectionId The ID of the collection to remove the item from.
     * @param itemId The ID of the item to remove.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The removed item, or null if the item was not found. Rejected - The error that caused the rejection.
     */
    function remove<CItem = Item>(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsOwner): Promise<CItem | null>;

    /**
     * @description
     * Removes a reference from the specified property.
     * 
     * @param collectionId The ID of the collection that contains the referring item.
     * @param propertyName The property to remove the reference from.
     * @param referringItem The referring item or referring item's ID.
     * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - When the references have been removed. Rejected - The error that caused the rejection.
     */
    function removeReference<CItem = Item>(
        collectionId: CollectionID,
        propertyName: Internal.CItemKeys<CItem>,
        referringItem: ItemID | Item,
        referencedItem: Item | Item[] | ItemID | ItemID[],
        options?: WeivDataOptions): Promise<void>;

    /**
     * @description
     * Renames a collection inside of a selected database. (User must have renameCollection permission inside MongoDB dashboard).
     * 
     * @param collectionId CollectionID (database/collection).
     * @param newCollectionName New name of collection.
     * @param options An object containing options to use when processing this operation.
     * @param renameOptions Native options of MongoDB driver when renaming a collection. [Read More](https://mongodb.github.io/node-mongodb-native/6.6/classes/Db.html#renameCollection).
     */
    function renameCollection(collectionId: CollectionID, newCollectionName: string, options?: WeivDataOptions, renameOptions?: RenameOptions): Promise<void>;

    /**
     * @description
     * Replaces and item in a collection. The `item` you passed with item param will take the place of existing data/document in your collection.
     * 
     * This function has it's own hooks beforeUpdate and afterUpdate is not used here instead beforeReplace and afterReplace is used.
     * 
     * @param collectionId The ID of the collection that contains the item to replace.
     * @param item The item to replace.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The item that was replaced. Rejected - The error that caused the rejection.
     */
    function replace<CItem = Item>(collectionId: CollectionID, item: CItem, options?: WeivDataOptionsOwner): Promise<CItem>;

    /**
     * @description
     * Replaces current references with references in the specified property. *This function uses update function internally.
     * 
     * @param collectionId The ID of the collection that contains the referring item.
     * @param propertyName The property to replaces the references in.
     * @param referringItem The referring item or referring item's ID.
     * @param referencedItem The referenced item, referenced item's ID, an array of referenced items, or an array of referenced item IDs.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - When the references have been inserted into relation array field. Rejected - The error that caused the rejection.
     */
    function replaceReferences<CItem = Item>(
        collectionId: CollectionID,
        propertyName: Internal.CItemKeys<CItem>,
        referringItem: ItemID | Item,
        referencedItem: Item | Item[] | ItemID | ItemID[],
        options?: WeivDataOptions): Promise<void>;

    /**
     * @description
     * Inserts or updates an item in a collection.
     * 
     * @param collectionId The ID of the collection to save the item to.
     * @param item The item to insert or update.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The item that was either inserted or updated, depending on whether it previously existed in the collection. Rejected - The error that caused the rejection.
     */ //@ts-ignore
    function save<CItem = Item>(collectionId: CollectionID, item: CItem, options?: WeivDataOptionsWriteOwner): Promise<SaveResult<CItem["_id"] extends string | ObjectId ? CItem : CItem & { _id: ItemID }>>;

    type SaveResult<CItem> = {
        /**
         * @description
         * Saved item.
         */
        item: CItem,

        /**
         * @description
         * Updated item id if item was updated.
         */
        upsertedId?: ItemID
    }

    /**
     * @description
     * Removes all items from a collection.
     * 
     * @param collectionId The ID of the collection to remove items from.
     * @param options An object containing options you can use when calling this function.
     * @returns Fulfilled - When the items have been removed. Rejected - The error that caused the rejection.
     */
    function truncate(collectionId: CollectionID, options?: WeivDataOptions): Promise<boolean>;

    /**
     * @description
     * Updates an item in a collection. !! IMPORTANT: In weiv-data you don't need to pass the al data. It's enough to just pass the updated values in your document.
     * Anything that's not in the update object will be untouched and will stay how it was before. In wix-data if you don't pass a field in your document it will be overwritten as undefined.
     * This doesn't apply to weiv-data. If you want this logic use replace function instead.
     * 
     * @param collectionId The ID of the collection that contains the item to update.
     * @param item The item to update.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The object that was updated. Rejected - The error that caused the rejection.
     */
    function update<CItem = Item>(collectionId: CollectionID, item: CItem, options?: WeivDataOptionsOwner): Promise<CItem>;

    /**
     * Hooks are just like in wix-data but we have some notes for you:
     * 
     * 1. We have some extra hooks for extra functions in weivData.
     * 2. onFailure will tun only for the errors that's fired from hooks.
     * 
     * > We are working to keep docs updated and add as much info as we can to provide better details.
     */
    namespace Hooks {
        type HookContext = {
            /**
             * @description
             * Database name.
             */
            dbName: string;

            /**
             * @description
             * Collection name.
             */
            collectionName: string;

            /**
             * @description
             * If there is one you'll have user id here (fetched from Wix Members data via wix-users-backend APIs)
             */
            userId?: string;

            /**
             * @description
             * Currecn user roles. (fetched from Wix Members data via wix-users-backend APIs)
             */
            userRoles: any[] | undefined;
        }

        /**
         * @description
         * Currently all supported hooks:
         * 
         * @note
         * onFailure hook is only triggered if error happens inside of the hooks it does not triggered by every error action.
         */
        type HookName = 'afterCount' | 'afterGet' | 'afterInsert' | 'afterQuery' | 'afterRemove' | 'afterUpdate' |
            'beforeCount' | 'beforeGet' | 'beforeInsert' | 'beforeQuery' | 'beforeRemove' | 'beforeUpdate' | 'onFailure' |
            'beforeReplace' | 'afterReplace' | 'beforeFindOne' | 'afterFindOne' | 'beforeGetAndUpdate' |
            'afterGetAndUpdate' | 'beforeGetAndReplace' | 'afterGetAndReplace' | 'beforeGetAndRemove' | 'afterGetAndRemove' |
            'beforeIncrement' | 'afterIncrement' | 'beforeMultiply' | 'afterMultiply' | 'beforePush' | 'afterPush' |
            'beforePull' | 'afterPull';

        /**
         * @description
         * A hook that is triggered after a `count()` operation.
         * 
         * @param count The number of items the count operation has found.
         * @param context Contextual information about the hook.
         * @returns The count to return to `count()` instead of the original count. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterCount(count: number, context: Hooks.HookContext): Promise<number> | number;

        /**
         * @description
         * A hook that is triggered after a `get()` operation.
         * 
         * @param item The item that was retrieved from the collection.
         * @param context Contextual information about the hook.
         * @returns The item to return to `get()` instead of the retrieved item. Returning a rejected promise will not block the operation, but will return a rejected promise to the operation caller as well as trigger the `onFailure()` hook.
         */
        function afterGet<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered after an `insert()` operation.
         * 
         * @param item The item that was inserted.
         * @param context Contextual information about the hook.
         * @returns The item to return to `insert()` instead of the inserted item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterInsert<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered after a `find` operation, for each of the items in the query results.
         * 
         * @param item One of the items of the query result. The hook is called for each item in the results.
         * @param context Contextual information about the hook.
         * @returns The item to return to `find` instead of the item retrieved from the database. Returning a rejected promise will not block the operation, but will return a rejected promise to the operation caller as well as trigger the `onFailure()` hook.
         */
        function afterQuery<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered after a `remove()` operation.
         * 
         * @param item The item that was removed.
         * @param context Contextual information about the hook.
         * @returns The item to return to `remove()` instead of the deleted item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterRemove<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered after an `update()` operation.
         * 
         * @param item The updated item.
         * @param context Contextual information about the hook.
         * @returns The item to return to `update()` instead of the updated item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterUpdate<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before a `count()` operation.
         * 
         * @param query The original query as defined by `count()`.
         * @param context Contextual information about the hook.
         * @returns The query to be used for the `count()` operation instead of the original query. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeCount<CItem = Item>(query: WeivDataQuery<CItem>, context: Hooks.HookContext): Promise<WeivDataQuery<CItem>> | WeivDataQuery<CItem>;

        /**
         * @description
         * A hook that is triggered before a `get()` operation.
         * 
         * @param itemId The ID of the original item to be retrieved.
         * @param context The ID of the original item to be retrieved.
         * @returns The ID to be used for the `get()` operation instead of the original itemId specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeGet(itemId: ItemID, context: Hooks.HookContext): Promise<ItemID> | ItemID;

        /**
         * @description
         * A hook that is triggered before an `insert()` operation.
         * 
         * @param item The original item to be inserted.
         * @param context Contextual information about the hook.
         * @returns The item to be inserted instead of the original item specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeInsert<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before a `find()` operation.
         * 
         * @param query The original query as specified by the caller.
         * @param context Contextual information about the hook.
         * @returns The query to use instead of the original query specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the operation caller as well as trigger the `onFailure()` hook.
         */
        function beforeQuery<CItem = Item>(query: WeivDataQuery<CItem>, context: Hooks.HookContext): Promise<WeivDataQuery<CItem>> | WeivDataQuery<CItem>;

        /**
         * @description
         * A hook that is called before a `remove()` operation.
         * 
         * @param itemId The ID of the original item to be removed.
         * @param context Contextual information about the hook.
         * @returns The ID to be used for the `remove()` instead of the original `itemId` specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeRemove(itemId: ItemID, context: Hooks.HookContext): Promise<ItemID> | ItemID;

        /**
         * @description
         * A hook that is triggered before an `update()` operation.
         * 
         * @param item The original item to be updated.
         * @param context Contextual information about the hook.
         * @returns The item to be updated instead of the original item specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeUpdate<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered on any error or rejected Promise from any of the weiv-data **hook** operations. (Operations except hooks doesn't trigger that currently.)
         * 
         * @param error The error that caused the failure.
         * @param context Contextual information about the hook.
         * @returns Fulfilled - Returning a fulfilled promise will result in a fulfilled data operation with the provided result. Rejected - Returning a rejected promise will result in returning a rejected promise to the caller of the data operation.
         */
        function onFailure(error: Error, context: Hooks.HookContext): Promise<Record<string, any>>;

        /**
         * @description
         * A hook that is triggered before an `replace()` operation.
         * 
         * @param item The original item to be replaced.
         * @param context Contextual information about the hook.
         * @returns The item to be replaced instead of the original item specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeReplace<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered after an `replace()` operation.
         * 
         * @param item The replaced item.
         * @param context 
         * @returns The item to return to `replace()` instead of the replaced item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterReplace<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before `findOne()` operation.
         * 
         * @param item The original find object to be used.
         * @param context 
         * @returns The find object to be used instead of the original find object specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeFindOne(findObject: { propertyName: string, value: any }, context: Hooks.HookContext): Promise<{ propertyName: string, value: any }> | { propertyName: string, value: any };

        /**
         * @description
         * A hook that is triggered after a `findOne()` operation.
         * 
         * @param item The found item.
         * @param context 
         * @returns The item to return to `findOne()` instead of the found item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterFindOne<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before `getAndUpdate()` operation.
         * 
         * @param item The original item to be updated.
         * @param context 
         * @returns The item to be updated instead of the original item specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeGetAndUpdate<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered after a `getAndUpdate()` operation.
         * 
         * @param item The updated item.
         * @param context 
         * @returns The item to return to `getAndUpdate()` instead of the updated item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterGetAndUpdate<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before `getAndReplace()` operation.
         * 
         * @param item The original item to be replaced.
         * @param context 
         * @returns The item to be replaced instead of the original item specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeGetAndReplace<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered after a `getAndReplace()` operation.
         * 
         * @param item The replaced item.
         * @param context 
         * @returns The item to return to `getAndReplace()` instead of the replaced item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
        */
        function afterGetAndReplace<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before `getAndRemove()` operation.
         * 
         * @param itemId The original itemId of the item to be removed.
         * @param context 
         * @returns The itemId of the item to be removed instead of the original itemId specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeGetAndRemove(itemId: ItemID, context: Hooks.HookContext): Promise<ItemID> | ItemID;

        /**
         * @description
         * A hook that is triggered after a `getAndRemove()` operation.
         * 
         * @param item The removed item.
         * @param context 
         * @returns The item to return to `getAndRemove()` instead of the removed item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterGetAndRemove<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before `increment()` operation.
         * 
         * @param incObject The original incObject to be used.
         * @param context 
         * @returns The incObject to be used instead of the original incObject specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeIncrement(incObject: { propertyName: string, value: number }, context: Hooks.HookContext): Promise<{ propertyName: string, value: number }> | { propertyName: string, value: number };

        /**
         * @description
         * A hook that is triggered after a `increment()` operation.
         * 
         * @param item The incremented item.
         * @param context 
         * @returns The item to return to `increment()` instead of the incremented item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterIncrement<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before `multiply()` operation.
         * 
         * @param multObject The original multObject to be used.
         * @param context 
         * @returns The multObject to be used instead of the original multObject specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeMultiply(multObject: { propertyName: string, value: number }, context: Hooks.HookContext): Promise<{ propertyName: string, value: number }> | { propertyName: string, value: number };

        /**
         * @description
         * A hook that is triggered after a `multiply()` operation.
         * 
         * @param item The multiplied item.
         * @param context 
         * @returns The item to return to `multiply()` instead of the multiplied item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterMultiply<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before `push()` operation.
         * 
         * @param pushObject The original pushObject to be used.
         * @param context 
         * @returns The pushObject to be used instead of the original pushObject specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforePush(pushObject: { propertyName: string, value: any }, context: Hooks.HookContext): Promise<{ propertyName: string, value: any }> | { propertyName: string, value: any };

        /**
         * @description
         * A hook that is triggered after a `push()` operation.
         * 
         * @param item The updated item with push.
         * @param context 
         * @returns The item to return to `push()` instead of the updated item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterPush<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;

        /**
         * @description
         * A hook that is triggered before `pull()` operation.
         * 
         * @param pullObject The original pushObject to be used.
         * @param context 
         * @returns The pullObject to be used instead of the original pullObject specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforePull(pullObject: { propertyName: string, value: any }, context: Hooks.HookContext): Promise<{ propertyName: string, value: any }> | { propertyName: string, value: any };

        /**
         * @description
         * A hook that is triggered after a `pull()` operation.
         * 
         * @param item The updated item with pull.
         * @param context The item to return to `pull()` instead of the updated item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterPull<CItem = Item>(item: CItem, context: Hooks.HookContext): Promise<Record<string, any>> | Record<string, any>;
    }

    /**
     * @description
     * Returns the current version of WeivData, for developers.
     */
    function _version(): string;

    /**
     * @description
     * Customizable options for WeivData library.
     */
    namespace CustomOptions {
        /**
         * @description
         * Inside the `backend/WeivData/connection-options.js` file you can define three different factory function and export them.
         * These factory functions can be used to customize each role's MongoClient connection options like connection pool settings etc.
         * 
         * @example
         * ```js
         * export const adminClientOptions = () => {
         *      // ... custom admin options here
         *      return;
         * }
         * 
         * export const memberClientOptions = () => {
         *      // ... custom member options here
         *      return;
         * }
         * 
         * export const visitorClientOptions = () => {
         *      // ... custom visitor options here
         *      return;
         * }
         * ```
         * 
         * You can also define custom cache options for all clients. These cache options define how to cache these clients. In most cases you don't need to play with this.
         * 
         * @example
         * ```js
         * export const clientCacheRules = () => {
         *      // ... custom client cache rules
         *      return;
         * }
         * ```
         * 
         * > You can create async functions too (in case you need to fetch something before setting up things).
         */
        interface ConnectionOptions {
            /**
             * @description
             * This is the same MongoClientOptions just like in MongoDB NodeJS driver, you can customize the admin MongoClient options.
             * 
             * [Read more about MongoClientOptions](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/MongoClientOptions.html)
             */
            adminClientOptions: () => MongoClientOptions | Promise<MongoClientOptions>;

            /**
             * @description
             * This is the same MongoClientOptions just like in MongoDB NodeJS driver, you can customize the member MongoClient options.
             * 
             * [Read more about MongoClientOptions](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/MongoClientOptions.html)
             */
            memberClientOptions: () => MongoClientOptions | Promise<MongoClientOptions>;

            /**
             * @description
             * This is the same MongoClientOptions just like in MongoDB NodeJS driver, you can customize the visitor MongoClient options.
             * 
             * [Read more about MongoClientOptions](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/MongoClientOptions.html)
             */
            visitorClientOptions: () => MongoClientOptions | Promise<MongoClientOptions>;

            /**
             * @description
             * This is general cache rules for all MongoClients you can define `node-cache` options here. These options will apply to all roles clients.
             * 
             * [Read more about NodeCache.Options](https://github.com/node-cache/node-cache/blob/master/index.d.ts#L149)
             */
            clientCacheRules: () => Options | Promise<Options>;
        }

        /**
         * @description
         * WeivData config object with required and optional flags. For now there isn't any option to change.
         */
        type WeivDataConfig = {
            /**
             * @description
             * 
             * This is the name of the database that you want to use to insert the data of Wix app collections. It can be any database you want.
             */
            syncDatabase?: string

            /**
             * @description
             * 
             * When enabled we will log information about sync operations (errors are always logged).
             * 
             * Example:
             * ```curl
             * Wix Members Created Runs - {entityId}
             * ```
             */
            enableSyncLogs?: boolean

            /**
             * @description
             * 
             * You can change the default _id type in WeivData, this option can be overwritten by the options you pass to the functions.
             * There are only two options: "String" or "ObjectID". If you don't pick any of these default will be "String".
             */
            defaultIdType?: "String" | "ObjectID"

            /**
             * @description
             * 
             * You can specify the default database name here, this is optional and can be overwritten by the collectionId you pass to functions. If not defined default value will be ExWeiv.
             */
            defaultDatabaseName?: string
        }

        /**
         * @description
         * Config options file (`backend/WeivData/config.js`) used for getting configs of WeivData, it's optional and not required so you don't have to define the function but you must create the config.js file.
         */
        interface ConfigOptions {
            /**
             * @description
             * `config` function which should be exported inside `backend/WeivData/config.js` file, is exporting the config object of WeivData to play with settings of the library.
             * 
             * @example
             * ```js
             * // Enable console logging (example)
             * export const config = () => {
             *      return {
             *          logs: true
             *      }
             * }
             * ```
             * 
             * > async is not allowed for config.
             */
            config: () => CustomOptions.WeivDataConfig;
        }

        /**@internal */
        const WeivDataConfig: WeivDataConfig;

        /**@internal */
        const ConnectionOptions: ConnectionOptions;
    }

    namespace Errors {
        type ErrorsList = {
            /**
             * @description
             * If you see this error, it means something is wrong and you should create a new issue on GitHub.
             */
            "00000": "No error message provided"

            /**
             * @description
             * This error usually means a parameter or something similar is in invalid format. For example instead of a string you may pass undefined or a number. Make sure you pass correct value type.
             */
            "00001": "The value type your've provided is not valid, make sure you pass valid value."

            /**
             * @description
             * There is something wrong in your `before` hook function.
             */
            "00002": "BeforeHook Error."

            /**
             * @description
             * There is something wrong in your `after` hook function.
             */
            "00003": "AfterHook Error."

            /**
             * @description
             * Count method of query class returned with an error. Something went wrong with count function in query.
             */
            "00004": "WeivData.Query.count error"

            /**
             * @description
             * Distnict method of query class returned with an error. Something went wrong with distnict function in query.
             */
            "00005": "WeivData.Query.distnict error"

            /**
             * @description
             * Find method of query class returned with an error. Something went wrong with find function in query.
             */
            "00006": "WeivData.Query.find error"

            /**
             * @description
             * If you see this error it means you've entered an invalid CollectionID because our parser were not able to find the both db and collection names. Make sure your CollectionID is in correct format. See example below:
             * 
             * ```js
             * const collectionId = "dbName/collectionName";
             * ```
             */
            "00007": "CollectionID is not in valid format, it should be a string and must look like this: DatabaseName/CollectionName"

            /**
             * @description
             * 
             * If you see this it's more likely to be an internal error and not your fault.
             */
            "00008": "Hook name type is invalid"

            /**
             * @description
             * 
             * Error occurred in an internal function not directly in the function you called. See details in the log message for more information.
             */
            "00009": "Internal Error"

            /**
             * @description
             * 
             * There is something wrong when converting _id fields. This error is more likely to be an internal error and not your fault.
             */
            "00010": "Internal ID Converter Error"

            /**
             * @description
             * 
             * This error is more likely to be related with Wix APIs, function that throws this error is responsible for finding current user id, it can be an admin, member or a visitor ID.
             */
            "00011": "Error when trying to find the currently logged-in member/visitor id in Wix Members."

            /**
             * @description
             * 
             * This error is coming from a helper function which is responsible for returning aggregation pipeline for finding referenced documents via queryReferenced.
             */
            "00012": "Something is wrong with queryReferenced function internal pipeline."

            /**
             * @description
             * 
             * This error is related with reference functions like queryReferenced, insertReference etc. Make sure your items/documents contains _id field with a valid value.
             */
            "00013": "Error while trying to find the _id of referenced/referring document/s."

            /**
             * @description
             * 
             * This error is related with functions that's using Wix Secrets APIs to get the secret value from Secret Manager.
             */
            "00014": "Error with Secrets, something went wrong with Wix Secret Manager"

            /**
             * @description
             * 
             * Something went wrong with a function that's trying to update the document, see the log details.
             */
            "00015": "Update Error"

            /**
             * @description
             * 
             * These errors contains all required information in the log message. We will convert all of these errors to a more user-friendly format in the future.
             */
            "00016": "General Error"

            /**
             * @description
             * 
             * These errors belongs to functions that deals with references. These errors are more general errors and usually contains related details in the log message.
             */
            "00017": "Reference Function Error"

            /**
             * @description
             * 
             * This error is coming from .native function of WeivData which should return a colleciton cursor so user can work with original MongoDB driver directly.
             */
            "00018": "Native Function Error"

            /**
             * @description
             * 
             * Removing cached values of WeivData was not successful.
             */
            "00019": "Error while removing cached values of WeivData"

            /**
             * @description
             * 
             * When you use filtering features of .query, .aggregate and .filter functions in WeivData you will see this error if something is wrong.
             */
            "00020": "Error with filtering methods, make sure you pass valid filter parameters in valid types"

            /**
             * @description
             * 
             * This error is related with errors coming from config generator function.
             */
            "00021": "Error on WeivData config object, make sure you pass correct config object"

            /**
             * @description
             * 
             * This error is coming from functions that's handling collection related things:
             * 
             * - createCollection
             * - deleteCollection
             * - listCollections
             * - renameCollection
             */
            "00022": "Collection Manager Error"

            /**
             * @description
             * 
             * This error is related with .aggregate function in WeivData.
             */
            "00023": "Aggegration Error"

            /**
             * @description
             * 
             * First of all Wix apps are firing events delayed time to time, and even if it's very rare you may have problems with events. This is how Wix app collections works right now.
             * For example, after you update a product the update event may run after 5 minutes. Yes it can be delayed that long time, and only thing you can do is contact Wix support and report this issue.
             * 
             * If there is an error with sync operation you will see all logs in a custom database called WeivDataWixAppsSyncLogs in this database you will see collections for each Wix application and logs with required information.
             * 
             * Example data in collections:
             * 
             * ```json
             * {
             *  "message": "Item couldn't be updated, due to error",
             *  "entityId": "09b39848-a4eb-4798-bee7-d9463474f812",
             *  "metadata": {}
             * }
             * ```
             */
            "00024": "Wix Application Sync Error"

            /**
             * @description
             * 
             * Another common WixSync plug-in error, this means that event object is undefined and due to this sync function can't work. Make sure you pass the event object that's exported from the native Wix event hook.
             */
            "00025": "Wix Application Sync Error - Event data not found, don't forget to pass the event object from the Wix event function"

            /**
             * @description
             * 
             * This is also another error from WixSync plug-in it means that you didn't configure the database name you want to use for your sync operations.
             * The selected database name will be used when saving/deleting the Wix applications data.
             */
            "00026": "You didn't configure any database name to sync Wix apps data!"
        }
    }

    /**
     * @Plugin
     * @description
     * 
     * This plugin helps you to sync Wix application collections directly with your MongoDB database, in this way you can perform lookup operations easily.
     * 
     * > Currently this feature is experimental and BUG fixes will be added in the future. And right now only available app is Wix Members.
     * 
     * ### How it Works?
     * 
     * For specific tasks you have pre-built functions that you can use to sync Wix app collections. For example for Wix Members you have created, updated and deleted events where you define it inside the events.js file.
     * In this events.js file you will define these events but you will use pre-built functions from WeivData library to sync the data.
     * 
     * Example code:
     * ```js
     * import { SyncWixApps } from '@exweiv/weiv-data';
     * const { wixMembers } = SyncWixApps;
     * 
     * export const wixMembers_onMemberCreated = (event) => wixMembers.onMemberCreated(event);
     * ```
     * 
     * In the example code above you can understand how it works with a single line of code. You can also add your own logic like this:
     * 
     * ```js
     * import { SyncWixApps } from '@exweiv/weiv-data';
     * const { wixMembers } = SyncWixApps;
     * 
     * export const wixMembers_onMemberCreated = (event) => {
     *      // Sync Data (no await needed because sync functions are void and doesn't return any value)
     *      wixMembers.onMemberCreated(event);
     * 
     *      // Your Own Logic
     * }
     * ```
     * 
     * ### Logs of Sync Errors
     * 
     * In case of an error you can find logs in `WeivDataWixAppsSyncLogs` database in your MongoDB cluster. In this database you will have multiple collections to collect logs about each individual application.
     * You can find error logs and it's details there. Plugin only save unexpected error logs not any other logs.
     * 
     * **Note:**
     * _id fields are automatically generated and they are ObjectId, instead of _id fields you can use entityId field which will be the equivalent of actual item _id.
     * 
     * Basically if you want to find a member by it's _id then use entityId field not _id field.
     */
    namespace SyncWixApps {
        /**
         * ## Wix Members Sync Plug-in
         * 
         * This plug-in allows you to sync Wix Members collections into your MongoDB cluster. In this was you can perform your data works with WeivData for Wix Members app data.
         * You can also perform lookups easily (references/includes) with any other collection you have in your MongoDB.
         * 
         * And there aren't any filtering etc. limit when you use WeivData, you can filter and query data however you want.
         * 
         * Right now you have 6 functions to sync these collections:
         * 
         * - Badges (WixMembersBadges)
         * - FullData (WixMembersFullData)
         * - PrivateMembersData (WixMembersPrivateData)
         * - PublicData (WixMembersPublicData)
         * 
         * The database name depends on your choice. You can configure it with config function.
         * 
         * ---
         * 
         * We do not suggest writing to these collections, use these collections to only read data from it.
         * 
         * ---
         * 
         * Functions are designed to work with `wix-members.v2` APIs Events. Define events inside the `events.js` file and point the functions you import from this plugin.
         * 
         * Example:
         * 
         * ```js
         * import { SyncWixApps } from '@exweiv/weiv-data';
         * const { wixMembers } = SyncWixApps;
         * 
         * export const wixMembers_onMemberCreated = (event) => wixMembers.onMemberCreated(event);
         * export const wixMembers_onMemberUpdated = (event) => wixMembers.onMemberUpdated(event);
         * export const wixMembers_onMemberDeleted = (event) => wixMembers.onMemberDeleted(event);
         * export const wixBadges_onBadgeCreated = (event) => wixMembers.onBadgeCreated(event);
         * export const wixBadges_onBadgeUpdated = (event) => wixMembers.onBadgeUpdated(event);
         * export const wixBadges_onBadgeDeleted = (event) => wixMembers.onBadgeDeleted(event);
         * ```
         */
        interface wixMembers {
            onMemberCreated(event: any): Promise<void>;
            onMemberUpdated(event: any): Promise<void>;
            onMemberDeleted(event: any): Promise<void>;

            onBadgeCreated(event: any): Promise<void>;
            onBadgeUpdated(event: any): Promise<void>;
            onBadgeDeleted(event: any): Promise<void>;
        }

        /**
         * ## Wix Stores Sync Plug-in
         * 
         * This plug-in allows you to sync some Wix Stores collections into your MongoDB cluster. In this way you can perform queries, lookups and all other things easily with WeivData.
         * There isn't any filtering etc. limit for these collections which you may see when you use WixData.
         * 
         * Right now you have 6 functions to sync these collections:
         * 
         * - Collections (WixStoresCollections)
         * - InventoryItems (WixStoresInventoryItems)
         * - Products (WixStoresProducts)
         * - Variants (WixStoresVariants)
         * 
         * The database name depends on your choice. You can configure it with config function.
         * 
         * ---
         * 
         * We do not suggest writing to these collections, use these collections to only read data from it.
         * 
         * ---
         * 
         * Functions are designed to work with `wix-stores-backend` APIs Events. Define events inside the `events.js` file and point the functions you import from this plugin.
         * 
         * Example:
         * 
         * ```js
         * import { SyncWixApps } from '@exweiv/weiv-data';
         * const { wixStores } = SyncWixApps;
         * 
         * export const wixStores_onCollectionCreated = (event) => wixStores.onCollectionCreated(event);
         * export const wixStores_onCollectionUpdated = (event) => wixStores.onCollectionUpdated(event);
         * export const wixStores_onCollectionDeleted = (event) => wixStores.onCollectionDeleted(event);
         * export const wixStores_onProductCreated = (event) => wixStores.onProductCreated(event);
         * export const wixStores_onProductUpdated = (event) => wixStores.onProductUpdated(event);
         * export const wixStores_onProductDeleted = (event) => wixStores.onProductDeleted(event);
         * ```
         */
        interface wixStores {
            onProductCreated(event: any): Promise<void>;
            onProductUpdated(event: any): Promise<void>;
            onProductDeleted(event: any): Promise<void>;

            onCollectionCreated(event: any): Promise<void>;
            onCollectionUpdated(event: any): Promise<void>;
            onCollectionDeleted(event: any): Promise<void>;
        }

        /**
         * ## Wix eCommerce Sync Plug-in
         * 
         * This plug-in allows you to sync orders and abandoned checkouts collections into your MongoDB cluster. In this way you can perform queries, lookups and all other things easily with WeivData.
         * There isn't any filtering etc. limit for these collections which you may see when you use WixData.
         * 
         * Right now you have 4 functions to sync these collections:
         * 
         * - Orders (WixeComOrders)
         * - AbandonedCheckouts (WixeComAbandonedCheckouts)
         * 
         * > Orders collection is normally inside the Wix Stores database in Wix so the "orders" collection we are referring here is that collection.
         * 
         * The database name depends on your choice. You can configure it with config function.
         * 
         * ---
         * 
         * We do not suggest writing to these collections, use these collections to only read data from it.
         * 
         * ---
         * 
         * Functions are designed to work with `wix-ecom-backend` APIs Events. Define events inside the `events.js` file and point the functions you import from this plugin.
         * 
         * Example:
         * 
         * ```js
         * import { SyncWixApps } from '@exweiv/weiv-data';
         * const { wixEcom } = SyncWixApps;
         * 
         * export const wixEcom_onOrderCreated = (event) => wixEcom.onOrderCreated(event);
         * export const wixEcom_onOrderUpdated = (event) => wixEcom.onOrderUpdated(event);
         * export const wixEcom_onAbandonedCheckoutCreated = (event) => wixEcom.onAbandonedCheckoutCreated(event);
         * export const wixEcom_onAbandonedCheckoutRecovered = (event) => wixEcom.onAbandonedCheckoutRecovered(event);
         * ```
         */
        interface wixEcom {
            onOrderCreated(event: any): Promise<void>;
            onOrderUpdated(event: any): Promise<void>;

            onAbandonedCheckoutCreated(event: any): Promise<void>;
            onAbandonedCheckoutRecovered(event: any): Promise<void>;
        }

        /**
         * ## Wix Marketing Sync Plug-in
         * 
         * This plug-in allows you to sync coupons collection into your MongoDB cluster. In this way you can perform queries, lookups and all other things easily with WeivData.
         * There isn't any filtering etc. limit for these collections which you may see when you use WixData.
         * 
         * Right now you have 3 functions to sync these collections:
         * 
         * - Coupons (WixMarketingCoupons)
         * 
         * The database name depends on your choice. You can configure it with config function.
         * 
         * ---
         * 
         * We do not suggest writing to these collections, use these collections to only read data from it.
         * 
         * ---
         * 
         * Functions are designed to work with `wix-marketing.v2` APIs Events. Define events inside the `events.js` file and point the functions you import from this plugin.
         * 
         * Example:
         * 
         * ```js
         * import { SyncWixApps } from '@exweiv/weiv-data';
         * const { wixMarketing } = SyncWixApps;
         * 
         * export const wixMarketing_onCouponCreated = (event) => wixMarketing.onCouponCreated(event);
         * export const wixMarketing_onCouponDeleted = (event) => wixMarketing.onCouponDeleted(event);
         * export const wixMarketing_onCouponUpdated = (event) => wixMarketing.onCouponUpdated(event);
         * ```
         */
        interface wixMarketing {
            onCouponCreated(event: any): Promise<void>;
            onCouponUpdated(event: any): Promise<void>;
            onCouponDeleted(event: any): Promise<void>;
        }

        /**
         * ## Wix Pricing Plans Sync Plug-in
         * 
         * This plug-in allows you to sync plans collection into your MongoDB cluster. In this way you can perform queries, lookups and all other things easily with WeivData.
         * There isn't any filtering etc. limit for these collections which you may see when you use WixData.
         * 
         * Right now you have 3 functions to sync these collections:
         * 
         * - Plans (WixPricingPlansPlans)
         * 
         * The database name depends on your choice. You can configure it with config function.
         * 
         * ---
         * 
         * We do not suggest writing to these collections, use these collections to only read data from it.
         * 
         * ---
         * 
         * Functions are designed to work with `wix-pricing-plans.v2` APIs Events. Define events inside the `events.js` file and point the functions you import from this plugin.
         * 
         * Example:
         * 
         * ```js
         * import { SyncWixApps } from '@exweiv/weiv-data';
         * const { wixPricingPlans } = SyncWixApps;
         * 
         * export const wixPricingPlansV2_onPlanCreated = (event) => wixPricingPlans.onPlanCreated(event);
         * export const wixPricingPlansV2_onPlanUpdated = (event) => wixPricingPlans.onPlanUpdated(event);
         * export const wixPricingPlansV2_onPlanArchived = (event) => wixPricingPlans.onPlanArchived(event);
         * ```
         */
        interface wixPricingPlans {
            onPlanCreated(event: any): Promise<void>;
            onPlanUpdated(event: any): Promise<void>;
            onPlanArchived(event: any, deletePlan?: boolean): Promise<void>;
        }

        /**
         * ## Wix Blog Sync Plug-in
         * 
         * This plug-in allows you to sync some collections into your MongoDB cluster. In this way you can perform queries, lookups and all other things easily with WeivData.
         * There isn't any filtering etc. limit for these collections which you may see when you use WixData.
         * 
         * Right now you have 9 functions to sync these collections:
         * 
         * - Posts (WixBlogPosts)
         * - Categories (WixBlogCategories)
         * - Tags (WixBlogTags)
         * 
         * The database name depends on your choice. You can configure it with config function.
         * 
         * ---
         * 
         * We do not suggest writing to these collections, use these collections to only read data from it.
         * 
         * ---
         * 
         * Functions are designed to work with `wix-blog-backend` APIs Events. Define events inside the `events.js` file and point the functions you import from this plugin.
         * 
         * Example:
         * 
         * ```js
         * import { SyncWixApps } from '@exweiv/weiv-data';
         * const { wixBlog } = SyncWixApps;
         * 
         * export const wixBlog_onCategoryCreated = (event) => wixBlog.onCategoryCreated(event);
         * export const wixBlog_onCategoryDeleted = (event) => wixBlog.onCategoryDeleted(event);
         * export const wixBlog_onCategoryUpdated = (event) => wixBlog.onCategoryUpdated(event);
         * export const wixBlog_onTagCreated = (event) => wixBlog.onTagCreated(event);
         * export const wixBlog_onTagDeleted = (event) => wixBlog.onTagDeleted(event);
         * export const wixBlog_onTagUpdated = (event) => wixBlog.onTagUpdated(event);
         * export const wixBlog_onPostCreated = (event) => wixBlog.onPostCreated(event);
         * export const wixBlog_onPostDeleted = (event) => wixBlog.onPostDeleted(event);
         * export const wixBlog_onPostUpdated = (event) => wixBlog.onPostUpdated(event);
         * ```
         */
        interface wixBlog {
            onPostCreated(event: any): Promise<void>;
            onPostUpdated(event: any): Promise<void>;
            onPostDeleted(event: any): Promise<void>;

            onCategoryCreated(event: any): Promise<void>;
            onCategoryUpdated(event: any): Promise<void>;
            onCategoryDeleted(event: any): Promise<void>;

            onTagCreated(event: any): Promise<void>;
            onTagUpdated(event: any): Promise<void>;
            onTagDeleted(event: any): Promise<void>;
        }

        /**@internal */
        const wixMembers: wixMembers;

        /**@internal */
        const wixStores: wixStores;

        /**@internal */
        const wixEcom: wixEcom;

        /**@internal */
        const wixMarketing: wixMarketing;

        /**@internal */
        const wixPricingPlans: wixPricingPlans;

        /**@internal */
        const wixBlog: wixBlog;
    }
}