import { Db, CountDocumentsOptions } from 'mongodb/mongodb';
import { merge, size, memoize, isEmpty } from 'lodash';
import { useClient } from '../Connection/automatic_connection_provider';
import { QueryResult } from './data_query_result';
import { splitCollectionId } from '../Helpers/name_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import type { WeivDataOptions, WeivDataOptionsCache, IncludeObject, WeivDataQueryResult } from '@exweiv/weiv-data';
import type { ConnectionHandlerResult } from '../Helpers/collection';

/** @internal */
export type LookupObject = {
    from: string,
    localField: string,
    foreignField: string,
    as: string,
    pipeline: { $limit: number }[]
}

/** @internal */
export type ReferenceLenghtObject = {
    [key: string]: {
        $cond: {
            if: { $isArray: string },
            then: { $size: string },
            else: 0
        }
    }
}

export class WeivDataQuery {
    private collectionId: string;
    private collectionName: string;
    private dbName = "exweiv";
    private db!: Db;
    private query: { [key: string]: object | string | number } = {};
    private sorting!: { [key: string]: 1 | -1; };
    private queryFields!: { [key: string]: 1 };
    private distinctValue!: string;
    private includeValues: { $lookup?: LookupObject, $unwind?: string }[] = [];
    private skipNumber!: number;
    private limitNumber = 50;
    private referenceLenght: ReferenceLenghtObject = {};
    private filters: { [key: string]: any } = {};

    /** @internal */
    constructor(collectionId: string) {
        if (!collectionId) {
            throw Error(`WeivData - Collection name required`);
        }

        this.collectionId = collectionId;
        const { dbName, collectionName } = splitCollectionId(collectionId);

        this.collectionName = collectionName;
        this.dbName = dbName;
    }

    // Filters
    and(query: WeivDataQuery): WeivDataQuery {
        if (!this.filters["$and"]) {
            this.filters["$and"] = [];
        }
        this.filters["$and"].push(query.filters);

        return this;
    }

    private memoizedBetween!: Function;
    between(propertyName: string, rangeStart: any, rangeEnd: any): WeivDataQuery {
        if (!this.memoizedBetween) {
            this.memoizedBetween = memoize((propertyName, rangeStart, rangeEnd) => {
                return this.addFilter(propertyName, {
                    $gte: rangeStart,
                    $lte: rangeEnd,
                });
            })
        }

        this.memoizedBetween(propertyName, rangeStart, rangeEnd);
        return this;
    }

    private memoizedContains!: Function;
    contains(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedContains) {
            this.memoizedContains = memoize((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: string,
                    $options: "i",
                });
            })
        }

        this.memoizedContains(propertyName, string);
        return this;
    }

    private memoizedEndsWith!: Function;
    endsWith(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedEndsWith) {
            this.memoizedEndsWith = memoize((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: `${string}$`,
                    $options: "i",
                });
            })
        }

        this.memoizedEndsWith(propertyName, string);
        return this;
    }

    private memoizedEq!: Function;
    eq(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedEq) {
            this.memoizedEq = memoize((propertyName, value) => {
                if (propertyName === "_id") {
                    return this.addFilter(propertyName, {
                        $eq: convertStringId(value),
                    });
                }

                return this.addFilter(propertyName, {
                    $eq: value,
                });
            })
        }

        this.memoizedEq(propertyName, value);
        return this;
    }

    private memoizedGe!: Function;
    ge(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedGe) {
            this.memoizedGe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $gte: value, });
            })
        }

        this.memoizedGe(propertyName, value);
        return this;
    }

    private memoizedGt!: Function;
    gt(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedGt) {
            this.memoizedGt = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $gt: value, });
            })
        }

        this.memoizedGt(propertyName, value);
        return this;
    }

    private memoizedHasAll!: Function;
    hasAll(propertyName: string, value: any): WeivDataQuery {
        if (!Array.isArray(value)) {
            value = [value];
        }

        if (!this.memoizedHasAll) {
            this.memoizedHasAll = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $all: value, });
            })
        }

        this.memoizedHasAll(propertyName, value);
        return this;
    }

    private memoizedHasSome!: Function;
    hasSome(propertyName: string, value: any): WeivDataQuery {
        if (!Array.isArray(value)) {
            value = [value];
        }

        if (!this.memoizedHasSome) {
            this.memoizedHasSome = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $in: value, });
            })
        }

        this.memoizedHasSome(propertyName, value);
        return this;
    }

    private memoizedIsEmpty!: Function;
    isEmpty(propertyName: string): WeivDataQuery {
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = memoize((propertyName) => {
                return this.addFilter(propertyName, { $exists: false, });
            })
        }

        this.memoizedIsEmpty(propertyName);
        return this;
    }

    private memoizedIsNotEmpty!: Function;
    isNotEmpty(propertyName: string): WeivDataQuery {
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = memoize((propertyName) => {
                return this.addFilter(propertyName, { $exists: true, });
            })
        }

        this.memoizedIsNotEmpty(propertyName);
        return this;
    }

    private memoizedLe!: Function;
    le(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedLe) {
            this.memoizedLe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $lte: value, });
            })
        }

        this.memoizedLe(propertyName, value);
        return this;
    }

    private memoizedLt!: Function;
    lt(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedLt) {
            this.memoizedLt = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $lt: value, });
            })
        }

        this.memoizedLt(propertyName, value);
        return this;
    }

    private memoizedNe!: Function;
    ne(propertyName: string, value: any): WeivDataQuery {
        if (!this.memoizedNe) {
            this.memoizedNe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $ne: value, });
            })
        }

        this.memoizedNe(propertyName, value);
        return this;
    }

    not(query: WeivDataQuery): WeivDataQuery {
        if (!this.filters["$nor"]) {
            this.filters["$nor"] = [];
        }
        this.filters["$nor"].push(query.filters);

        return this;
    }

    or(query: WeivDataQuery): WeivDataQuery {
        if (!this.filters["$or"]) {
            this.filters["$or"] = [];
        }
        this.filters["$or"].push(query.filters);

        return this;
    }

    private memoizedStartsWith!: Function;
    startsWith(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedStartsWith) {
            this.memoizedStartsWith = memoize((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: `^${string}`,
                    $options: "i",
                });
            })
        }

        this.memoizedStartsWith(propertyName, string);
        return this;
    }
    // End of Filters

    ascending(...propertyName: string[]): WeivDataQuery {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const name of propertyName) {
            this.sorting = merge(this.sorting, {
                [name]: 1
            })
        }

        return this;
    }

    async count(options: WeivDataOptions): Promise<number> {
        try {
            const { suppressAuth, readConcern, suppressHooks } = options;
            const { collection } = await this.connectionHandler(suppressAuth);

            // Add filters to query
            this.filtersHandler();
            const context = prepareHookContext(this.collectionId);

            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await runDataHook<'beforeCount'>(this.collectionId, "beforeCount", [this, context]).catch((err) => {
                    throw Error(`WeivData - beforeCount Hook Failure ${err}`);
                });
            }

            const countOptions: CountDocumentsOptions = readConcern ? { readConcern } : {};

            let totalCount;
            if (editedQurey) {
                totalCount = await collection.countDocuments(editedQurey.query, isEmpty(editedQurey.query) ? { ...countOptions, hint: "_id_" } : countOptions);
            } else {
                totalCount = await collection.countDocuments(this.query, isEmpty(this.query) ? { ...countOptions, hint: "_id_" } : countOptions);
            }

            if (suppressHooks != true) {
                let editedCount = await runDataHook<'afterCount'>(this.collectionId, "afterCount", [totalCount, context]).catch((err) => {
                    throw Error(`WeivData - afterCount Hook Failure ${err}`);
                });

                if (editedCount) {
                    return editedCount;
                }
            }

            return totalCount;
        } catch (err) {
            throw Error(`WeivData - Error when using count with weivData.query: ${err}`);
        }
    }

    descending(...propertyName: string[]): WeivDataQuery {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const name of propertyName) {
            this.sorting = merge(this.sorting, {
                [name]: -1
            })
        }

        return this;
    }

    async distinct(propertyName: string, options: WeivDataOptions): Promise<WeivDataQueryResult> {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        this.distinctValue = propertyName;
        return this.runQuery(options);
    }

    fields(...propertyName: string[]): WeivDataQuery {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const name of propertyName) {
            this.queryFields = merge(this.queryFields, {
                [name]: 1
            })
        }

        return this;
    }

    async find(options: WeivDataOptionsCache): Promise<WeivDataQueryResult> {
        return this.runQuery(options);
    }

    include(...includes: IncludeObject[]): WeivDataQuery {
        if (!includes) {
            throw Error(`WeivData - Property name required!`);
        }

        for (const { fieldName, collectionName, foreignField, as, maxItems, countItems } of includes) {
            if (countItems === true) {
                this.referenceLenght = merge(this.referenceLenght, {
                    [`${fieldName}Length`]: {
                        $cond: {
                            if: { $isArray: `$${fieldName}` },
                            then: { $size: `$${fieldName}` },
                            else: 0
                        }
                    }
                })
            }

            this.includeValues.push({
                $lookup: {
                    from: collectionName,
                    localField: fieldName,
                    foreignField: foreignField || "_id",
                    as: as || fieldName,
                    pipeline: [{ $limit: maxItems || 50 }]
                }
            })
        }

        return this;
    }

    limit(limit: number): WeivDataQuery {
        if (!limit && limit != 0) {
            throw Error(`WeivData - Limit number is required!`);
        }

        if (limit != 0) {
            this.limitNumber = limit;
        }

        return this;
    }

    skip(skip: number): WeivDataQuery {
        if (!skip && skip != 0) {
            throw Error(`WeivData - Skip number is required!`);
        }
        this.skipNumber = skip;
        return this;
    }

    // HELPER FUNCTIONS IN CLASS
    /** @internal */
    private async runQuery(options?: WeivDataOptionsCache): Promise<WeivDataQueryResult> {
        try {
            const { suppressAuth, suppressHooks, readConcern, enableCache, cacheTimeout } = options || {};
            const { collection } = await this.connectionHandler(suppressAuth);

            const context = prepareHookContext(this.collectionId);

            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await runDataHook<'beforeQuery'>(this.collectionId, "beforeQuery", [this, context]).catch((err) => {
                    throw Error(`WeivData - beforeQuery Hook Failure ${err}`);
                });
            }

            let classInUse = !editedQurey ? this : editedQurey;

            const query = {
                filters: classInUse.filters,
                dbName: classInUse.dbName,
                includeValues: classInUse.includeValues,
                limit: classInUse.limitNumber,
                collectionName: classInUse.collectionName
            }

            // Add filters to query
            classInUse.filtersHandler();
            const result = await new QueryResult({
                enableCache: enableCache || false,
                cacheTimeout: cacheTimeout || 15,
                suppressAuth,
                readConcern,
                collection,
                pageSize: classInUse.limitNumber,
                dbName: classInUse.dbName,
                collectionName: classInUse.collectionName,
                queryClass: query,
                queryOptions: {
                    query: classInUse.query,
                    distinctProperty: classInUse.distinctValue,
                    skip: classInUse.skipNumber,
                    sort: classInUse.sorting,
                    fields: classInUse.queryFields,
                    includes: classInUse.includeValues,
                    addFields: classInUse.referenceLenght
                }
            }).getResult();

            if (suppressHooks != true) {
                const hookedItems = await result.items.map(async (item, index) => {
                    const editedItem = await runDataHook<'afterQuery'>(classInUse.collectionId, "afterQuery", [item, context]).catch((err) => {
                        console.error(`WeivData - afterQuery Hook Failure ${err} Item Index: ${index}`);
                    });

                    if (editedItem) {
                        return editedItem;
                    } else {
                        return item;
                    }
                })

                const fulfilledItems = await Promise.all(hookedItems);
                return {
                    ...result,
                    items: fulfilledItems
                };
            }

            return result;
        } catch (err) {
            throw Error(`WeivData - Error when using query (runQuery): ${err}`);
        }
    }

    /**@internal */
    private addFilter(propertyName: string, newFilter: { [key: string]: any }) {
        this.filters[propertyName] = {
            ...this.filters[propertyName],
            ...newFilter
        }
        return this.filters;
    }

    /** @internal */
    private filtersHandler(): void {
        // Check if there is any filters
        if (size(this.filters) > 0) {
            this.query = merge(this.query, this.filters)
        }
    }

    /** @internal */
    private async connectionHandler(suppressAuth = false): Promise<ConnectionHandlerResult<false>> {
        const { pool, memberId } = await useClient(suppressAuth);

        if (this.dbName) {
            this.db = pool.db(this.dbName);
        } else {
            this.db = pool.db("ExWeiv");
        }

        const collection = this.db.collection(this.collectionName);
        return { collection, memberId };
    }
}