import { MongoClient, Collection, ObjectId } from 'mongodb/mongodb';
import { DataQuery } from './src/DataQuery/data_query'

declare global {
    type PermissionsReturn = {
        uri: string,
        memberId?: string
    }

    type ConnectionCleanUp = () => Promise<void> | void
    type ClientSetupResult = {
        pool: MongoClient,
        cleanup: ConnectionCleanUp,
        memberId?: string
    }

    type PipelineArray = {
        _owner?: string,
        $match?: object,
        $sort?: object,
        $group?: object,
        $project?: object,
        $skip?: object,
        $limit?: object,
        $out?: object,
        $merge?: object,
    }[];

    type AggregateRunOptions = {
        suppressAuth?: boolean;
        consistentRead?: boolean;
        cleanupAfter?: boolean;
    };

    type AggregateResult = {
        items: Array<object>;
        length: number;
        hasNext(): boolean;
        next(cleanupAfter?: boolean): Promise<AggregateResult>;
    };

    type ConnectionResult = {
        collection: Collection,
        cleanup: ConnectionCleanUp,
        memberId?: string
    }

    type PipelineGroupObject<T> = {
        _id?: T;
        [key?: string]: any;
        $group?: object;
    };

    type SortingObject = {
        propertyName: string;
        type: 1 | -1;
    }

    type HavingFilter = {
        $match: object;
    };

    type QuerySort = {
        [key: string]: 1 | -1;
    }

    type QueryOptions = {
        suppressAuth: boolean,
        suppressHooks: boolean,
        consistentRead: boolean,
        cleanupAfter: boolean
    }

    type QueryFields = {
        [key: string]: 1
    }

    type QueryResult = {
        currentPage: number,
        items: object[],
        length: number,
        pageSize: number,
        query: { [key: string]: any },
        totalCount: number,
        totalPages: number,
        hasNext(): boolean,
        hasPrev(): boolean,
        next(cleanupAfter?: boolean): Promise<QueryResult>,
        prev(cleanupAfter?: boolean): Promise<QueryResult>
    }

    type IncludeObject = {
        collectionName: string,
        fieldName: string,
        foreignField?: string,
        as?: string
        type?: "single" | "multi" | "mixed",
        maxItems?: number,
        countItems?: boolean
    }

    type QueryResultOptions = {
        suppressAuth?: boolean,
        consistentRead?: boolean,
        suppressHooks?: boolean
        pageSize: number,
        dbName: string,
        collectionName: string,
        queryClass: { [key: string]: any },
        queryOptions: QueryResultQueryOptions,
        collection: Collection
    }

    type QueryResultQueryOptions = {
        query: QueryFilters,
        distinctProperty?: string,
        skip?: number,
        sort?: QuerySort,
        fields?: QueryFields,
        includes: { $lookup?: LookupObject, $unwind?: string }[],
        addFields: ReferenceLenghtObject
    }

    type LookupObject = {
        from: string,
        localField: string,
        foreignField: string,
        as: string,
        pipeline: { $limit: number }[]
    }

    type QueryFilters = {
        [key: string]: object | string | number
    }

    type ReferenceLenghtObject = {
        [key: string]: {
            $cond: {
                if: { $isArray: string },
                then: { $size: string },
                else: 0
            }
        }
    }

    type WeivDataOptions = {
        suppressAuth?: boolean,
        suppressHooks?: boolean,
        consistentRead?: boolean,
        cleanupAfter?: boolean,
        enableVisitorId?: boolean
    }

    type DataItemValues = { _id?: ObjectId | string, [key: string]: any; };
    type DataItemValuesUpdate = { _id: ObjectId | string, [key: string]: any; };
    type DataItemValuesInsert = { [key: string]: any; };

    type AggregateResultOptions = {
        pageSize: number,
        pipeline: PipelineArray,
        databaseName: string,
        collectionName: string,
        suppressAuth?: boolean
    }

    type ReferringItem = string | DataItemValuesUpdate
    type ReferencedItemSingle = DataItemValues | string
    type ReferencedItem = DataItemValuesUpdate | string | DataItemValuesUpdate[] | string[]

    type BulkInsertResult = {
        insertedItems: DataItemValues[],
        insertedItemIds: {
            [key: number]: InferIdType<TSchema>;
        },
        inserted: number
    }

    type CachedMongoClients = {
        [key: string]: MongoClient
    }

    type HookContext = { collectionName: string, userId: string | null, userRoles: object[] }
    type HookArgs = [item: object | string, context: HookContext];
    type FailureHookArgs = [error: Error, context: HookContext];

    type HookName = 'afterCount' | 'afterGet' | 'afterInsert' | 'afterQuery' | 'afterRemove' | 'afterUpdate' | 'beforeCount' | 'beforeGet' | 'beforeInsert' | 'beforeQuery' | 'beforeRemove' | 'beforeUpdate';
    type HookReturnType<HookName> = HookName extends 'beforeGet' ? string | ObjectId | undefined : object | undefined;
}