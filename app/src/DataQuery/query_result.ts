import { Db, Document, Collection } from "mongodb/mongodb";
import { useClient } from '../Connection/connection_provider';
import { size } from 'lodash';
import NodeCache from "node-cache";

const cache = new NodeCache({
    stdTTL: 30,
    checkperiod: 5,
    useClones: true,
    deleteOnExpire: true
})

class DataQueryResult {
    private dataQueryClass!: { [key: string]: any };
    private suppressAuth = false;
    private consistentRead = false;
    private suppressHooks = false;
    private pageSize: number = 50;
    private dbName!: string;
    private collectionName!: string;
    private currentPage = 1;
    private queryOptions!: QueryResultQueryOptions;
    private db!: Db;
    private collection!: Collection;
    private cleanup!: ConnectionCleanUp;

    constructor(options: QueryResultOptions) {
        const { suppressAuth, pageSize, dbName, collectionName, queryClass, queryOptions, consistentRead, collection, suppressHooks } = options;

        if (!pageSize || !queryOptions || !dbName || !collectionName || !queryClass) {
            throw Error(`WeivData - Required Param/s Missing`);
        }

        this.collection = collection;
        this.consistentRead = consistentRead || false;
        this.suppressHooks = suppressHooks || false;
        this.suppressAuth = suppressAuth || false;
        this.dataQueryClass = queryClass;
        this.pageSize = pageSize;
        this.queryOptions = queryOptions;
        this.dbName = dbName;
        this.collectionName = collectionName;
    }

    private async getItems(): Promise<Document[]> {
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

                    if (this.consistentRead === true) {
                        (aggregateCursor as any).readConcern('majority');
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

                    if (this.consistentRead === true) {
                        (findCursor as any).readConcern('majority');
                    }

                    return await findCursor.toArray();
                }
            }
        } catch (err) {
            throw Error(`WeivData - Error when using query (getItems): ${err}`);
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

            const totalCount = await this.collection.countDocuments(query);
            return totalCount;
        } catch (err) {
            throw Error(`WeivData - Error when using query (getTotalCount): ${err}`);
        }
    }

    async getResult(): Promise<QueryResult> {
        try {
            const cacheKey = this.generateCacheKey();
            const cachedResult = cache.get(cacheKey) as QueryResult | undefined;

            if (cachedResult) {
                return cachedResult;
            }

            if (!this.collection) {
                const { collection, cleanup } = await this.connectionHandler(this.suppressAuth);
                this.collection = collection;
                this.cleanup = cleanup;
            }

            const { skip } = this.queryOptions;
            const items = await this.getItems();
            const totalCount = await this.getTotalCount();

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
                next: async (cleanupAfter?: boolean) => {
                    this.currentPage++;
                    if (cleanupAfter === true) {
                        // Close the connection
                        await this.cleanup();
                    }
                    return this.getResult();
                },
                prev: async (cleanupAfter?: boolean) => {
                    this.currentPage--;
                    if (cleanupAfter === true) {
                        // Close the connection
                        await this.cleanup();
                    }
                    return this.getResult();
                }
            }

            cache.set(cacheKey, result);
            return result;
        } catch (err) {
            throw Error(`WeivData - Error when using query: ${err}`);
        }
    }

    private async connectionHandler(suppressAuth: boolean): Promise<ConnectionResult> {
        try {
            const { pool, cleanup, memberId } = await useClient(suppressAuth);

            if (this.dbName) {
                this.db = pool.db(this.dbName);
            } else {
                this.db = pool.db("exweiv");
            }

            const collection = this.db.collection(this.collectionName);
            return { collection, cleanup, memberId };
        } catch (err) {
            throw Error(`WeivData - Error when connecting to MongoDB Client via query function class: ${err}`);
        }
    }

    private generateCacheKey(): string {
        return `${this.dbName}-${this.collectionName}-${this.currentPage}-${JSON.stringify(this.queryOptions)}`;
    }
}

export function WeivDataQueryResult(options: QueryResultOptions) {
    try {
        return new DataQueryResult(options);
    } catch (err) {
        throw Error(`WeivData - Error when returning query result class: ${err}`);
    }
}