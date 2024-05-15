import { Db, Collection } from "mongodb/mongodb";
import { useClient } from '../Connection/automatic_connection_provider';
import { isEmpty, size } from 'lodash';
import NodeCache from "node-cache";
import type { ConnectionHandlerResult } from "../Helpers/collection";
import type { LookupObject, ReferenceLenghtObject } from "./data_query";
import type { ReadConcern, Item, WeivDataQueryResult } from '@exweiv/weiv-data'

const cache = new NodeCache({
    checkperiod: 5,
    useClones: false,
    deleteOnExpire: true
});

/** @internal */
export type DataQueryResultOptions = {
    enableCache: boolean,
    cacheTimeout: number,
    suppressAuth?: boolean,
    readConcern?: ReadConcern,
    pageSize: number,
    dbName: string,
    collectionName: string,
    queryClass: { [key: string]: any },
    queryOptions: QueryResultQueryOptions,
    collection: Collection
}

/** @internal */
type QueryResultQueryOptions = {
    query: { [key: string]: object | string | number },
    distinctProperty?: string,
    skip?: number,
    sort?: { [key: string]: 1 | -1; },
    fields?: { [key: string]: 1 },
    includes: { $lookup?: LookupObject, $unwind?: string }[],
    addFields: ReferenceLenghtObject
}

export class QueryResult {
    private dataQueryClass!: { [key: string]: any };
    private suppressAuth = false;
    private readConcern: ReadConcern = "local";
    private pageSize: number = 50;
    private dbName!: string;
    private collectionName!: string;
    private currentPage = 1;
    private queryOptions!: QueryResultQueryOptions;
    private db!: Db;
    private collection!: Collection;
    private cacheTimeout: number;
    private enableCache: boolean;

    constructor(options: DataQueryResultOptions) {
        const { suppressAuth, pageSize, dbName, collectionName, queryClass, queryOptions, readConcern, collection, cacheTimeout, enableCache } = options;

        if (!pageSize || !queryOptions || !dbName || !collectionName || !queryClass) {
            throw new Error(`required param/s missing! (pageSize, queryOptions, dbName, collectionName and queryClass are required params)`);
        }

        this.cacheTimeout = cacheTimeout;
        this.enableCache = enableCache;
        this.collection = collection;
        this.readConcern = readConcern || "local";
        this.suppressAuth = suppressAuth || false;
        this.dataQueryClass = queryClass;
        this.pageSize = pageSize;
        this.queryOptions = queryOptions;
        this.dbName = dbName;
        this.collectionName = collectionName;
    }

    private async getItems(): Promise<Item[]> {
        try {
            const { query, distinctProperty, skip, sort, fields, includes, addFields } = this.queryOptions;

            if (distinctProperty) {
                // Use distinct()
                const distinctItems = await this.collection.distinct(distinctProperty, query);
                return distinctItems;
            } else {
                // Check if there is any included fields in this query to determine to use find() or aggregate()
                if (size(includes) > 0) {
                    // Use aggregate()
                    const pipeline = [];

                    if (size(query) > 0) {
                        pipeline.push({
                            $match: query
                        })
                    }

                    if (sort) {
                        pipeline.push({
                            $sort: sort
                        })
                    }

                    if (fields) {
                        pipeline.push({
                            $project: fields
                        })
                    }

                    if (size(addFields) > 0) {
                        pipeline.push({
                            $addFields: addFields
                        })
                    }

                    for (const include of includes) {
                        if (include.$lookup) {
                            pipeline.push({
                                $lookup: include.$lookup
                            })
                        }
                    }

                    for (const include of includes) {
                        if (include.$unwind) {
                            pipeline.push({
                                $unwind: include.$unwind
                            })
                        }
                    }

                    pipeline.push({
                        $skip: skip || 0 + ((this.currentPage - 1) * this.pageSize)
                    })

                    pipeline.push({
                        $limit: this.pageSize
                    })

                    const aggregateCursor = this.collection.aggregate(pipeline);

                    if (this.readConcern) {
                        aggregateCursor.withReadConcern(this.readConcern);
                    }

                    return await aggregateCursor.toArray();
                } else {
                    // Use find()
                    const findCursor = this.collection.find(query, {
                        sort,
                        projection: fields
                    });

                    findCursor.skip(skip || 0 + ((this.currentPage - 1) * this.pageSize));
                    findCursor.limit(this.pageSize);

                    if (this.readConcern) {
                        findCursor.withReadConcern(this.readConcern)
                    }

                    return await findCursor.toArray();
                }
            }
        } catch (err) {
            throw new Error(`WeivData - Error when using query (getItems): ${err}`);
        }
    }

    private async getTotalCount(): Promise<number> {
        try {
            const { query, distinctProperty } = this.queryOptions;

            if (distinctProperty) {
                const pipeline = [
                    { $group: { _id: `$${distinctProperty}`, count: { $sum: 1 }, }, },
                    { $group: { _id: null, distinctCount: { $sum: 1 }, }, }
                ]

                const result = await this.collection.aggregate(pipeline).toArray();

                if (result.length > 0) {
                    return result[0].distinctCount;
                } else {
                    return 0;
                }
            }

            const totalCount = await this.collection.countDocuments(query, isEmpty(query) ? { hint: "_id_" } : {});
            return totalCount;
        } catch (err) {
            throw new Error(`WeivData - Error when using query (getTotalCount): ${err}`);
        }
    }

    async getResult(): Promise<WeivDataQueryResult> {
        try {
            const cacheKey = this.generateCacheKey();

            if (this.enableCache) {
                const cachedResult = cache.get(cacheKey) as WeivDataQueryResult | undefined;
                if (cachedResult) {
                    return cachedResult;
                }
            }

            if (!this.collection) {
                const { collection } = await this.connectionHandler(this.suppressAuth);
                this.collection = collection;
            }

            const { skip } = this.queryOptions;
            const [items, totalCount] = await Promise.all([this.getItems(), this.getTotalCount()]);

            const result = {
                currentPage: this.currentPage,
                items,
                length: items.length,
                pageSize: this.pageSize,
                query: this.dataQueryClass,
                totalCount,
                totalPages: Math.ceil(totalCount / this.pageSize),
                hasNext: () => this.currentPage * this.pageSize < totalCount,
                hasPrev: () => {
                    if (skip) {
                        if (skip > 0 && skip >= this.pageSize) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return this.currentPage > 1;
                    }
                }, //todo
                next: async () => {
                    this.currentPage++;
                    return this.getResult();
                },
                prev: async () => {
                    this.currentPage--;
                    return this.getResult();
                }
            }

            if (this.enableCache) {
                cache.set(cacheKey, result, this.cacheTimeout);
            }

            return result;
        } catch (err) {
            throw new Error(`WeivData - Error when using query: ${err}`);
        }
    }

    private async connectionHandler(suppressAuth: boolean): Promise<ConnectionHandlerResult<false>> {
        try {
            const { pool, memberId } = await useClient(suppressAuth);

            if (this.dbName) {
                this.db = pool.db(this.dbName);
            } else {
                this.db = pool.db("ExWeiv");
            }

            const collection = this.db.collection(this.collectionName);
            return { collection, memberId };
        } catch (err) {
            throw new Error(`WeivData - Error when connecting to MongoDB Client via query function class: ${err}`);
        }
    }

    private generateCacheKey(): string {
        return `${this.dbName}-${this.collectionName}-${this.currentPage}-${JSON.stringify(this.queryOptions)}`;
    }
}

/**@internal */
export function getQueryCache() {
    return cache;
}