import { AggregateResult, RunOptions } from "../../weiv-data";

import { DataAggregate } from "../DataAggregate/data_aggregate";
import { DataFilter } from "../DataFilter/data_filter";
import { DataQuery } from '../DataQuery/data_query';
import { DataQueryFilter } from '../DataQuery/data_query_filters';

export interface DataAggregateInterface {
    ascending(propertyName: string): DataAggregate;
    avg(propertyName: string, projectedName?: string): DataAggregate;
    count(): DataAggregate;
    descending(propertyName: string): DataAggregate;
    filter(filter: DataFilter): DataAggregate;
    group(propertyName: string | string[]): DataAggregate;
    having(filter: DataFilter): DataAggregate;
    limit(limit: number): DataAggregate;
    max(propertyName: string, projectedName?: string): DataAggregate;
    min(propertyName: string, projectedName: string): DataAggregate;
    run(options: RunOptions): Promise<AggregateResult>;
    skip(skip: number): DataAggregate;
    sum(propertyName: string, projectedName: string): DataAggregate;
}

// Filters for filter()
export interface DataFilterInterface {
    and(query: DataFilter): DataFilter;
    between(propertyName: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): DataFilter;
    contains(propertyName: string, string: string): DataFilter;
    endsWith(propertyName: string, string: string): DataFilter;
    eq(propertyName: string, value: unknown): DataFilter;
    ge(propertyName: string, value: string | number | Date): DataFilter;
    gt(propertyName: string, value: string | number | Date): DataFilter;
    hasAll(propertyName: string, value: string | number | Date | [unknown]): DataFilter;
    hasSome(propertyName: string, value: string | number | Date | [unknown]): DataFilter;
    isEmpty(propertyName: string): DataFilter;
    isNotEmpty(propertyName: string): DataFilter;
    le(propertyName: string, value: string | number | Date): DataFilter;
    lt(propertyName: string, value: string | number | Date): DataFilter;
    ne(propertyName: string, value: unknown): DataFilter;
    not(query: DataFilter): DataFilter;
    or(query: DataFilter): DataFilter;
    startsWith(propertyName: string, string: string): DataFilter;
}

export interface DataQueryFilterInterface {
    and(query: DataQueryFilter): DataQueryFilter;
    between(propertyName: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): DataQuery;
    contains(propertyName: string, string: string): DataQuery;
    endsWith(propertyName: string, string: string): DataQuery;
    eq(propertyName: string, value: unknown): DataQuery;
    ge(propertyName: string, value: string | number | Date): DataQuery;
    gt(propertyName: string, value: string | number | Date): DataQuery;
    hasAll(propertyName: string, value: string | number | Date | [unknown]): DataQuery;
    hasSome(propertyName: string, value: string | number | Date | [unknown]): DataQuery;
    isEmpty(propertyName: string): DataQuery;
    isNotEmpty(propertyName: string): DataQuery;
    le(propertyName: string, value: string | number | Date): DataQuery;
    lt(propertyName: string, value: string | number | Date): DataQuery;
    ne(propertyName: string, value: unknown): DataQuery;
    not(query: DataQueryFilter): DataQueryFilter;
    or(query: DataQueryFilter): DataQueryFilter;
    startsWith(propertyName: string, string: string): DataQuery;
}