import { MongoClient, Collection } from 'mongodb/mongodb';
import { DataQuery } from './src/DataQuery/data_query'

declare global {
    type ConnectionCleanUp = () => Promise<void> | void

    type MongoStubPool = {
        db(): any,
        close: () => Promise<void>,
    }

    type MongoStubClient = {
        connect: () => Promise<MongoStubPool>
    }

    type MongoClientPool = {
        [uri: string]: MongoClient | MongoStubClient
    }

    type PermissionsReturn = {
        uri: string,
        memberId?: string
    }

    type ClientSetupResult = {
        pool: MongoClient | MongoStubPool,
        cleanup: ConnectionCleanUp,
        memberId?: string | undefined
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
        cleanAfterRun?: boolean;
    };

    type AggregateResult = {
        items: Array<object>;
        length: number;
        hasNext(): boolean;
        next(cleanAfterRun?: boolean): Promise<AggregateResult>;
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
        cleanAfterRun: boolean
    }

    type QueryFields = {
        [key: string]: 1
    }

    type QueryResult = {
        currentPage: number,
        items: object[],
        length: number,
        pageSize: number,
        query: DataQuery,
        totalCount: number,
        totalPages: number,
        hasNext(): boolean,
        hasPrev(): boolean,
        next(cleanAfterRun?: boolean): Promise<QueryResult>,
        prev(cleanAfterRun?: boolean): Promise<QueryResult>
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
        queryClass: DataQuery,
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
}