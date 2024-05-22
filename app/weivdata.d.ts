/**
 * WeivData is a package that's built top of native MongoDB NodeJS driver. This package provides similar/same APIs with wix-data to make it easier for Velo developers to find an external DB solution.
 */
declare module '@exweiv/weiv-data' {
    /**
     * @description
     * An object to define some options when including other relational fields.
     */
    type IncludeObject = {
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
    type CacheSelections = "permissions" | "secrets" | "get" | "isreferenced" | "query" | "helpersecrets" | "connectionclients";

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
    type Item = { [key: string]: any };

    /**
     * @description
     * An option to choose a consistency level when reading data from MongoDB Clusters.
     */
    type ReadConcern = "local" | "majority" | "linearizable" | "available" | "snapshot";

    /**
     * An object that you pass as the `options` parameter that modifies how an operation is performed.
     */
    type WeivDataOptions = {
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
    }

    /**
     * @description
     * An object that you pass as the `options` parameter that modifies how an operation is performed. Unlike `WeivDataOptions` this type has cache control over the action.
     */
    type WeivDataOptionsCache = {
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
    } & WeivDataOptions;

    /**
     * @description
     * WeivData options only for some write functions like insert. Where you can insert new data into collection.
     */
    type WeivDataOptionsWrite = {
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
    } & WeivDataOptions;

    /**
     * @description
     * WeivData options only for query function.
     */
    type WeivDataOptionsQuery = {
        /**
         * @description
         * By default this is true and you can disable it if you want, when it's disabled (false) we won't fetch the total count of the items.
         */
        omitTotalCount?: boolean
    } & WeivDataOptions;

    /**
     * @description
     * WeivData options where onlyOwner is possible.
     */
    type WeivDataOptionsOwner = {
        /**
         * @description
         * When sert to true WeivData will add another filter and check if _owner field of the item matches with current member id.
         * This will make it possible to take action only if current member is the owner of the data.
         */
        onlyOwner?: boolean
    } & WeivDataOptions;

    /**
     * @description
     * WeivData options where onlyOwner is possible with enableVisitorId.
     */
    type WeivDataOptionsWriteOwner = WeivDataOptionsOwner & WeivDataOptionsWrite;

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

    /**
     * @description
     * Creates an aggregation.
     * 
     * @param collectionId The ID of the collection to run the aggregation on.
     * @returns An aggregation cursor.
     */
    function aggregate(collectionId: CollectionID): WeivDataAggregate;

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
    interface WeivDataAggregate {
        /**
         * @description
         * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in ascending order.
         * 
         * @param propertyName The properties used in the sort.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        ascending(propertyName: string): WeivDataAggregate;

        /**
         * @description
         * Refines a `WeivDataAggregate` to only contain the average value from each aggregation group.
         * 
         * @param propertyName The property in which to find the average value.
         * @param projectedName The name of the property in the aggregation results containing the average value.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        avg(propertyName: string, projectedName?: string): WeivDataAggregate;

        /**
         * @description
         * Refines a `WeivDataAggregate` to contain the item count of each group in the aggregation.
         * 
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        count(): WeivDataAggregate;

        /**
         * @description
         * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in descending order.
         * 
         * @param propertyName The properties used in the sort.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        descending(propertyName: string): WeivDataAggregate;

        /**
         * @description
         * Filters out items from being used in an aggregation.
         * 
         * @param filter The filter to use to filter out items from being used in the aggregation.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        filter(filter: WeivDataFilter): WeivDataAggregate;

        /**
         * @description
         * Groups items together in an aggregation.
         * 
         * @param propertyName The property or properties to group on.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        group(...propertyName: string[]): WeivDataAggregate;

        /**
         * @description
         * Limits the number of items or groups the aggregation returns.
         * 
         * @param limit The number of items or groups to return.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        limit(limit: number): WeivDataAggregate;

        /**
         * @description
         * Refines a `WeivDataAggregate` to only contain the maximum value from each aggregation group.
         * 
         * @param propertyName The property in which to find the maximum value.
         * @param projectedName The name of the property in the aggregation results containing the maximum value.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        max(propertyName: string, projectedName?: string): WeivDataAggregate;

        /**
         * @description
         * Refines a `WeivDataAggregate` to only contain the minimum value from each aggregation group.
         * 
         * @param propertyName The property in which to find the minimum value.
         * @param projectedName The name of the property in the aggregation results containing the minimum value.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        min(propertyName: string, projectedName?: string): WeivDataAggregate;

        /**
         * @description
         * Runs the aggregation and returns the results.
         * 
         * @param options Options to use when running an aggregation.
         * @returns Fulfilled - A Promise that resolves to the results of the aggregation. Rejected - Error that caused the aggregation to fail.
         */
        run(options?: WeivDataAggregateRunOptions): Promise<WeivDataAggregateResult>;

        /**
         * @description
         * Sets the number of items or groups to skip before returning aggregation results.
         * 
         * @param skip The number of items or groups to skip in the aggregation results before returning the results.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        skip(skip: number): WeivDataAggregate;

        /**
         * @description
         * Refines a `WeivDataAggregate` to contain the sum from each aggregation group.
         * 
         * @param propertyName The property in which to find the sum.
         * @param projectedName The name of the property in the aggregation results containing the sum.
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        sum(propertyName: string, projectedName?: string): WeivDataAggregate;

        /**
         * @description
         * This method allows you to add one or more pipeline stages, and mix with other methods. Checkout MongoDB aggregation pipeline for more information.
         * 
         * @param pipelineStage 
         * @returns A `WeivDataAggregate` cursor representing the refined aggregation.
         */
        stage(...stage: PipelineStage[]): WeivDataAggregate;
    }

    interface WeivDataAggregateResult {
        /**
         * @description
         * Gets the aggregated values.
         */
        readonly items: Item[];

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
        next(): Promise<WeivDataAggregateResult>;

        /**
         * @description
         * Returns the pipeline created when performing the aggregation.
         */
        readonly pipeline: import('mongodb/mongodb').Document[];
    }

    type WeivDataAggregateRunOptions = {
        suppressAuth?: boolean,
        readConcern?: ReadConcern
    }

    /**
     * @description
     * Creates a filter to be used with aggregations and some other methods.
     * 
     * @returns A filter object.
     */
    function filter(): WeivDataFilter;

    interface WeivDataFilter {
        /**
         * @description
         * Adds an and condition to the query or filter.
         * 
         * @param query A query to add to the initial query as an and condition.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        and(query: WeivDataFilter): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is within a specified range.
         * 
         * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
         * @param rangeStart The beginning value of the range to match against.
         * @param rangeEnd The ending value of the range to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        between(propertyName: string, rangeStart: any, rangeEnd: any): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value contains a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for inside the specified property value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        contains(propertyName: string, string: string): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value ends with a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for at the end of the specified property value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        endsWith(propertyName: string, string: string): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value equals the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        eq(propertyName: string, value: any): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        ge(propertyName: string, value: any): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is greater than the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        gt(propertyName: string, value: any): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property values equals all of the specified value parameters.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The values to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        hasAll(propertyName: string, value: any): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The values to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        hasSome(propertyName: string, value: any): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property does not exist or does not have any value.
         * 
         * @param propertyName The the property in which to check for a value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        isEmpty(propertyName: string): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property has any value.
         * 
         * @param propertyName The property in which to check for a value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        isNotEmpty(propertyName: string): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        le(propertyName: string, value: any): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is less than the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        lt(propertyName: string, value: any): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value does not equal the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        ne(propertyName: string, value: any): WeivDataFilter;

        /**
         * @description
         * Adds a `not` condition to the query or filter.
         * 
         * @param query A query to add to the initial query as a not condition.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        not(query: WeivDataFilter): WeivDataFilter;

        /**
         * @description
         * Adds an `or` condition to the query or filter.
         * 
         * @param query A query to add to the initial query as an `or` condition.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        or(query: WeivDataFilter): WeivDataFilter;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value starts with a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for at the beginning of the specified property value.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        startsWith(propertyName: string, string: string): WeivDataFilter;
    }

    /**
     * @description
     * Creates a query for retrieving items from a database collection.
     * 
     * @param collectionId The ID of the collection to run the query on.
     * @returns A query object.
     */
    function query(collectionId: CollectionID): WeivDataQuery;

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
    interface WeivDataQuery {
        /**
         * @description
         * Adds an and condition to the query or filter.
         * 
         * @param query A query to add to the initial query as an and condition.
         * @returns  A `WeivDataFilter` cursor representing the refined filters.
         */
        and(query: WeivDataQuery): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is within a specified range.
         * 
         * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
         * @param rangeStart The beginning value of the range to match against.
         * @param rangeEnd The ending value of the range to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        between(propertyName: string, rangeStart: any, rangeEnd: any): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value contains a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for inside the specified property value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        contains(propertyName: string, string: string): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value ends with a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for at the end of the specified property value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        endsWith(propertyName: string, string: string): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value equals the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        eq(propertyName: string, value: any): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        ge(propertyName: string, value: any): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is greater than the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        gt(propertyName: string, value: any): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property values equals all of the specified value parameters.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The values to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        hasAll(propertyName: string, value: any): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The values to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        hasSome(propertyName: string, value: any): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property does not exist or does not have any value.
         * 
         * @param propertyName The the property in which to check for a value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        isEmpty(propertyName: string): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property has any value.
         * 
         * @param propertyName The property in which to check for a value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        isNotEmpty(propertyName: string): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        le(propertyName: string, value: any): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value is less than the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        lt(propertyName: string, value: any): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value does not equal the specified value.
         * 
         * @param propertyName The property whose value will be compared with `value`.
         * @param value The value to match against.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        ne(propertyName: string, value: any): WeivDataQuery;

        /**
         * @description
         * Adds a `not` condition to the query or filter.
         * 
         * @param query A query to add to the initial query as a not condition.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        not(query: WeivDataQuery): WeivDataQuery;

        /**
         * @description
         * Adds an `or` condition to the query or filter.
         * 
         * @param query A query to add to the initial query as an `or` condition.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        or(query: WeivDataQuery): WeivDataQuery;

        /**
         * @description
         * Refines a query or filter to match items whose specified property value starts with a specified string.
         * 
         * @param propertyName The property whose value will be compared with the string.
         * @param string The string to look for at the beginning of the specified property value.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        startsWith(propertyName: string, string: string): WeivDataQuery;

        /**
         * @description
         * Adds a sort to a query or sort, sorting by the specified properties in ascending order.
         * 
         * @param propertyName The properties used in the sort.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        ascending(...propertyName: string[]): WeivDataQuery;

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
        descending(...propertyName: string[]): WeivDataQuery;

        /**
         * @description
         * Returns the distinct values that match the query, without duplicates.
         * 
         * @param propertyName The property whose value will be compared for distinct values.
         * @param options An object containing options to use when processing this operation.
         * @returns Fulfilled - A Promise that resolves to the results of the query. Rejected - Error that caused the query to fail.
         */
        distinct(propertyName: string, options?: WeivDataOptions): Promise<WeivDataQueryResult>;

        /**
         * @description
         * Lists the fields to return in a query's results.
         * 
         * @param propertyName Properties to return. To return multiple properties, pass properties as additional arguments.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        fields(...propertyName: string[]): WeivDataQuery;

        /**
         * @description
         * Returns the items that match the query.
         * 
         * @param options An object containing options to use when processing this operation.
         * @returns Fulfilled - A Promise that resolves to the results of the query. Rejected - Error that caused the query to fail.
         */
        find(options?: WeivDataOptionsQuery): Promise<WeivDataQueryResult>;

        /**
         * @description
         * Includes referenced items for the specified properties in a query's results.
         * 
         * @param includes Array of objects that you want to include with details
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        include(...includes: IncludeObject[]): WeivDataQuery;

        /**
         * @description
         * Limits the number of items the query returns.
         * 
         * @param limit The number of items to return, which is also the `pageSize` of the results object.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        limit(limit: number): WeivDataQuery;

        /**
         * @description
         * Sets the number of items to skip before returning query results.
         * 
         * @param skip The number of items to skip in the query results before returning the results.
         * @returns  A `WeivDataQuery` cursor representing the refined filters.
         */
        skip(skip: number): WeivDataQuery;
    }

    interface WeivDataQueryResult {
        /**
         * @description
         * Returns the index of the current results page number.
         */
        readonly currentPage: number;

        /**
         * @description
         * Returns the items that match the query.
         */
        readonly items: Item[];

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
        next(): Promise<WeivDataQueryResult>;

        /**
         * @description
         * Retrieves the previous page of query results.
         * 
         * @returns Fulfilled - A query result object with the previous page of query results. Rejected - The errors that caused the rejection.
         */
        prev(): Promise<WeivDataQueryResult>;
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
    function bulkInsert(collectionId: CollectionID, items: Item[], options?: WeivDataOptionsWrite): Promise<BulkInsertResult>;

    type BulkInsertResult = {
        /**
         * @description
         * Total number of inserted items.
         */
        inserted: number,

        /**
         * @description
         * Item ids as string objectId
         */
        insertedItemIds: string[]

        /**
         * @description
         * Inserted items.
         */
        insertedItems: Item[]
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
    function bulkRemove(collectionId: CollectionID, itemsIds: ItemID[], options?: WeivDataOptionsOwner): Promise<BulkRemoveResult>;

    type BulkRemoveResult = {
        /**
         * @description
         * Total number of removed items.
         */
        removed: number,

        /**
         * @description
         * Removed item ids as string objectId
         */
        removedItemIds: string[]
    }

    /**
     * @description
     * Inserts or updates a number of items in a collection.
     * 
     * @param collectionId The ID of the collection to save the items to.
     * @param items The items to insert or update.
     * @param options An object containing options to use when processing this operation.
     */
    function bulkSave(collectionId: CollectionID, items: Item[], options?: WeivDataOptionsWriteOwner): Promise<BulkSaveResult>;

    type BulkSaveResult = {
        /**
         * @description
         * Total number of inserted items.
         */
        inserted: number,

        /**
         * @description
         * Inserted item ids as string objectid
         */
        insertedItemIds: string[],

        /**
         * @description
         * Updated items.
         */
        savedItems: Item[],

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
    function bulkUpdate(collectionId: CollectionID, items: Item[], options?: WeivDataOptionsWriteOwner): Promise<BulkUpdateResult>;

    type BulkUpdateResult = {
        /**
         * @description
         * Total number of updated items.
         */
        updated: number,

        /**
         * @description
         * Updated items.
         */
        updatedItems: Item[]
    }

    /**
     * @description
     * Creates a new collection inside of a selected database. (User must have createCollection permission inside MongoDB dashboard).
     * 
     * @param collectionId CollectionID (database/collection).
     * @param suppressAuth A boolean value to bypass permissions.
     * @param options Native options of MongoDB driver when creating a collection. [Read Here](https://mongodb.github.io/node-mongodb-native/6.6/interfaces/CreateCollectionOptions.html)
     */
    function createCollection(collectionId: CollectionID, suppressAuth?: boolean, options?: import('mongodb').CreateCollectionOptions): Promise<void>;

    /**
     * @description
     * Deletes a collection inside of a selected database. (User must have dropCollection permission inside MongoDB dashboard).
     * 
     * @param collectionId CollectionID (database/collection).
     * @param suppressAuth A boolean value to bypass permissions.
     * @param options Native options of MongoDB driver when deleting a collection. [Read Here](https://mongodb.github.io/node-mongodb-native/6.6/interfaces/DropCollectionOptions.html)
     */
    function deleteCollection(collectionId: CollectionID, suppressAuth?: boolean, options?: import('mongodb').CreateCollectionOptions): Promise<boolean>;

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
    function findOne(collectionId: CollectionID, propertyName: string, value: any, options?: WeivDataOptionsCache): Promise<Item | undefined>;

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
    function getAndReplace(collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptionsOwner): Promise<Item | undefined>;

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
    function getAndUpdate(collectionId: CollectionID, itemId: ItemID, value: Item, options?: WeivDataOptionsOwner): Promise<Item | undefined>;

    /**
     * @description
     * You can convert your string ids to ObjectIds or ObjectIds to string ids with this helper function integrated to this library.
     * 
     * @param id ID you want to convert can be string or a valid ObjectId
     * @param stringMethod Optional converting method can be "base64" or "hex" defaults to "hex"
     * @returns Fulfilled - ObjectId or stringId reverse of the input. Rejected - The error caused the rejection.
     */
    function convertId(id: ItemID, stringMethod?: "base64" | "hex"): ItemID;

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
    function increment(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: number, options?: WeivDataOptions): Promise<Item | null>;

    /**
     * @description
     * Adds an item to a collection.
     * 
     * @param collectionId The ID of the collection to add the item to.
     * @param item The item to add.
     * @param options An object containing options to use when processing this operation.
     * @returns Fulfilled - The item that was added. Rejected - The error that caused the rejection.
     */
    function insert(collectionId: CollectionID, item: Item, options?: WeivDataOptionsWrite): Promise<Item>;

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
    function listCollections(databaseName: string, suppressAuth?: boolean, filter?: Item, listOptions?: import('mongodb').ListCollectionsOptions): Promise<import('mongodb').CollectionInfo[]>;

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
    function multiply(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: number, options?: WeivDataOptions): Promise<Item | null>;

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
    function native(collectionId: CollectionID, suppressAuth?: boolean): Promise<import('mongodb').Collection>;

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
    function pull(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: any, options?: WeivDataOptions): Promise<Item | null>;

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
    function push(collectionId: CollectionID, itemId: ItemID, propertyName: string, value: any, options?: WeivDataOptions): Promise<Item | null>;

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
    function queryReferenced(
        collectionId: CollectionID,
        targetCollectionId: string,
        itemId: ItemID,
        propertyName: string,
        queryOptions: WeivDataQueryReferencedOptions,
        options?: WeivDataOptions): Promise<WeivDataQueryReferencedResult>;

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

    interface WeivDataQueryReferencedResult {
        /**
         * @description
         * Returns the items that match the reference query.
         */
        items: Item[];

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
        next(): Promise<WeivDataQueryReferencedResult>;

        /**
         * @description
         * Retrieves the previous page of reference query results.
         * 
         * @returns Fulfilled - A query result object with the previous page of query results. Rejected - The errors that caused the rejection.
         */
        prev(): Promise<WeivDataQueryReferencedResult>;
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
    function remove(collectionId: CollectionID, itemId: ItemID, options?: WeivDataOptionsOwner): Promise<Item | null>;

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
    function removeReference(
        collectionId: CollectionID,
        propertyName: string,
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
    function renameCollection(collectionId: CollectionID, newCollectionName: string, options?: WeivDataOptions, renameOptions?: import('mongodb').RenameOptions): Promise<void>;

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
    function replace(collectionId: CollectionID, item: Item, options?: WeivDataOptionsOwner): Promise<Item>;

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
    function replaceReferences(
        collectionId: CollectionID,
        propertyName: string,
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
     */
    function save(collectionId: CollectionID, item: Item, options?: WeivDataOptionsWriteOwner): Promise<SaveResult>;

    type SaveResult = {
        /**
         * @description
         * Saved item.
         */
        item: Item,

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
    function update(collectionId: CollectionID, item: Item, options?: WeivDataOptionsOwner): Promise<Item>;

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
        function afterGet(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered after an `insert()` operation.
         * 
         * @param item The item that was inserted.
         * @param context Contextual information about the hook.
         * @returns The item to return to `insert()` instead of the inserted item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterInsert(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered after a `find` operation, for each of the items in the query results.
         * 
         * @param item One of the items of the query result. The hook is called for each item in the results.
         * @param context Contextual information about the hook.
         * @returns The item to return to `find` instead of the item retrieved from the database. Returning a rejected promise will not block the operation, but will return a rejected promise to the operation caller as well as trigger the `onFailure()` hook.
         */
        function afterQuery(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered after a `remove()` operation.
         * 
         * @param item The item that was removed.
         * @param context Contextual information about the hook.
         * @returns The item to return to `remove()` instead of the deleted item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterRemove(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered after an `update()` operation.
         * 
         * @param item The updated item.
         * @param context Contextual information about the hook.
         * @returns The item to return to `update()` instead of the updated item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterUpdate(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered before a `count()` operation.
         * 
         * @param query The original query as defined by `count()`.
         * @param context Contextual information about the hook.
         * @returns The query to be used for the `count()` operation instead of the original query. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeCount(query: WeivDataQuery, context: Hooks.HookContext): Promise<WeivDataQuery> | WeivDataQuery;

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
        function beforeInsert(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered before a `find()` operation.
         * 
         * @param query The original query as specified by the caller.
         * @param context Contextual information about the hook.
         * @returns The query to use instead of the original query specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the operation caller as well as trigger the `onFailure()` hook.
         */
        function beforeQuery(query: WeivDataQuery, context: Hooks.HookContext): Promise<WeivDataQuery> | WeivDataQuery;

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
        function beforeUpdate(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered on any error or rejected Promise from any of the weiv-data **hook** operations. (Operations except hooks doesn't trigger that currently.)
         * 
         * @param error The error that caused the failure.
         * @param context Contextual information about the hook.
         * @returns Fulfilled - Returning a fulfilled promise will result in a fulfilled data operation with the provided result. Rejected - Returning a rejected promise will result in returning a rejected promise to the caller of the data operation.
         */
        function onFailure(error: Error, context: Hooks.HookContext): Promise<Object>;

        /**
         * @description
         * A hook that is triggered before an `replace()` operation.
         * 
         * @param item The original item to be replaced.
         * @param context Contextual information about the hook.
         * @returns The item to be replaced instead of the original item specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeReplace(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered after an `replace()` operation.
         * 
         * @param item The replaced item.
         * @param context 
         * @returns The item to return to `replace()` instead of the replaced item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterReplace(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

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
        function afterFindOne(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered before `getAndUpdate()` operation.
         * 
         * @param item The original item to be updated.
         * @param context 
         * @returns The item to be updated instead of the original item specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeGetAndUpdate(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered after a `getAndUpdate()` operation.
         * 
         * @param item The updated item.
         * @param context 
         * @returns The item to return to `getAndUpdate()` instead of the updated item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function afterGetAndUpdate(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered before `getAndReplace()` operation.
         * 
         * @param item The original item to be replaced.
         * @param context 
         * @returns The item to be replaced instead of the original item specified by the caller. Returning a rejected promise will block the operation and will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
         */
        function beforeGetAndReplace(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

        /**
         * @description
         * A hook that is triggered after a `getAndReplace()` operation.
         * 
         * @param item The replaced item.
         * @param context 
         * @returns The item to return to `getAndReplace()` instead of the replaced item. Returning a rejected promise will not block the operation, but will return a rejected promise to the caller as well as trigger the `onFailure()` hook.
        */
        function afterGetAndReplace(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

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
        function afterGetAndRemove(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

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
        function afterIncrement(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

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
        function afterMultiply(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

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
        function afterPush(item: Item, context: Hooks.HookContext): Promise<Object> | Object;

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
        function afterPull(item: Item, context: Hooks.HookContext): Promise<Object> | Object;
    }

    /**
     * @description
     * Returns the current version of WeivData, for developers.
     */
    function _version(): string;

    namespace ConnectionOptionsJS {
        /**
         * @description
         * Inside the `backend/WeivData/connection-options.js` file you can define three different variable and export them.
         * These variables can be used to customize each role's MongoClient connection options like connection pool settings etc.
         * 
         * @example
         * ```js
         * export const adminClientOptions = {
         *      // ... custom admin options here
         * }
         * 
         * export const memberClientOptions = {
         *      // ... custom member options here
         * }
         * 
         * export const visitorClientOptions = {
         *      // ... custom visitor options here
         * }
         * ```
         * 
         * You can also define custom cache options for all clients. These cache options define how to cache these clients. In most cases you don't need to play with this.
         * 
         * @example
         * ```js
         * export const clientCacheRules = {
         *      // ... custom client cache rules
         * }
         * ```
         */
        interface Options {
            /**
             * @description
             * This is the same MongoClientOptions just like in MongoDB NodeJS driver, you can customize the admin MongoClient options.
             * 
             * [Read more about MongoClientOptions](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/MongoClientOptions.html)
             */
            adminClientOptions: import('mongodb').MongoClientOptions;

            /**
             * @description
             * This is the same MongoClientOptions just like in MongoDB NodeJS driver, you can customize the member MongoClient options.
             * 
             * [Read more about MongoClientOptions](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/MongoClientOptions.html)
             */
            memberClientOptions: import('mongodb').MongoClientOptions;

            /**
             * @description
             * This is the same MongoClientOptions just like in MongoDB NodeJS driver, you can customize the visitor MongoClient options.
             * 
             * [Read more about MongoClientOptions](https://mongodb.github.io/node-mongodb-native/6.5/interfaces/MongoClientOptions.html)
             */
            visitorClientOptions: import('mongodb').MongoClientOptions;

            /**
             * @description
             * This is general cache rules for all MongoClients you can define `node-cache` options here. These options will apply to all roles clients.
             * 
             * [Read more about NodeCache.Options](https://github.com/node-cache/node-cache/blob/master/index.d.ts#L149)
             */
            clientCacheRules: import('node-cache').Options;
        }
    }
}