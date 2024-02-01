import { MongoClient, Collection, ObjectId, Document } from 'mongodb/mongodb';
import { DataQuery } from './src/DataQuery/data_query';

declare global {
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

    type IncludeObject = {
        collectionName: string,
        fieldName: string,
        foreignField?: string,
        as?: string
        type?: "single" | "multi" | "mixed",
        maxItems?: number,
        countItems?: boolean
    }

    type WeivDataOptions = {
        suppressAuth?: boolean | undefined,
        suppressHooks?: boolean | undefined,
        consistentRead?: boolean | undefined,
        cleanupAfter?: boolean | undefined,
        enableVisitorId?: boolean | undefined
    }

    type DataItemValues = { _id?: ObjectId | string, [key: string]: any; };
    type DataItemValuesUpdate = { _id: ObjectId | string, [key: string]: any; };
    type DataItemValuesInsert = { [key: string]: any };

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

    type HookContext = { collectionName: string, userId: string | null, userRoles: object[] }
    type FailureHookArgs = [error: Error, context: HookContext];

    type QueryReferencedOptions = { pageSize: number, order: 'asc' | 'desc' };

    type WeivDataQueryReferencedResult = {
        items: Document[],
        totalCount: number,
        hasNext(): boolean,
        hasPrev(): boolean,
        next(cleanupAfter?: boolean): Promise<WeivDaaQueryReferencedResult>,
        prev(cleanupAfter?: boolean): Promise<WeivDaaQueryReferencedResult>
    }
}