import { memoize, merge } from 'lodash';
import { WeivDataQuery } from './data_query';
import { convertStringId } from '../Helpers/item_helpers';
import { QueryFilters } from '../../weivdata';

export class WeivDataQueryFilter {
    protected filters: QueryFilters = {};
    private dataQueryClass!: WeivDataQuery;

    /** @internal */
    constructor() { }

    /**
     * Adds an `and` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as an `and` condition.
     * @return {WeivDataQueryFilter} A `WeivDataQuery` object representing the refined query.
     */
    and(query: WeivDataQueryFilter): WeivDataQueryFilter {
        this.filters = merge(query.filters, this.filters);
        return this;
    }

    private memoizedBetween!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is within a specified range.
     * 
     * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
     * @param rangeStart The beginning value of the range to match against.
     * @param rangeEnd The ending value of the range to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    between(propertyName: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): WeivDataQuery {
        if (!this.memoizedBetween) {
            this.memoizedBetween = memoize((propertyName, rangeStart, rangeEnd) => {
                return this.addFilter({
                    [propertyName]: {
                        $gte: rangeStart,
                        $lte: rangeEnd,
                    },
                });
            })
        }

        this.memoizedBetween(propertyName, rangeStart, rangeEnd);
        return this.dataQueryClass;
    }

    private memoizedContains!: Function;
    /**
     * Refines a query or filter to match items whose specified property value contains a specified string.
     * 
     * @param propertyName 
     * @param string 
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    contains(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedContains) {
            this.memoizedContains = memoize((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: string,
                        $options: "i",
                    },
                });
            })
        }

        this.memoizedContains(propertyName, string);
        return this.dataQueryClass;
    }

    private memoizedEndsWith!: Function;
    /**
     * Refines a query or filter to match items whose specified property value ends with a specified string.
     * 
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the end of the specified property value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    endsWith(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedEndsWith) {
            this.memoizedEndsWith = memoize((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: `${string}$`,
                        $options: "i",
                    },
                });
            })
        }

        this.memoizedEndsWith(propertyName, string);
        return this.dataQueryClass;
    }

    private memoizedEq!: Function;
    /**
     * Refines a query or filter to match items whose specified property value equals the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    eq(propertyName: string, value: unknown): WeivDataQuery {
        if (!this.memoizedEq) {
            this.memoizedEq = memoize((propertyName, value) => {
                if (propertyName === "_id") {
                    return this.addFilter({
                        [propertyName]: convertStringId(value),
                    });
                }

                return this.addFilter({
                    [propertyName]: value,
                });
            })
        }

        this.memoizedEq(propertyName, value);
        return this.dataQueryClass;
    }

    private memoizedGe!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    ge(propertyName: string, value: string | number | Date): WeivDataQuery {
        if (!this.memoizedGe) {
            this.memoizedGe = memoize((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $gte: value,
                    },
                });
            })
        }

        this.memoizedGe(propertyName, value);
        return this.dataQueryClass;
    }

    private memoizedGt!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is greater than the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    gt(propertyName: string, value: string | number | Date): WeivDataQuery {
        if (!this.memoizedGt) {
            this.memoizedGt = memoize((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $gt: value,
                    },
                });
            })
        }

        this.memoizedGt(propertyName, value);
        return this.dataQueryClass;
    }

    private memoizedHasAll!: Function;
    /**
     * Refines a query or filter to match items whose specified property values equals all of the specified `value` parameters.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    hasAll(propertyName: string, value: string | number | Date | [unknown]): WeivDataQuery {
        if (!Array.isArray(value)) {
            value = [value];
        }

        if (!this.memoizedHasAll) {
            this.memoizedHasAll = memoize((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $all: value,
                    },
                });
            })
        }

        this.memoizedHasAll(propertyName, value);
        return this.dataQueryClass;
    }

    private memoizedHasSome!: Function;
    /**
     * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    hasSome(propertyName: string, value: string | number | Date | [unknown]): WeivDataQuery {
        if (!Array.isArray(value)) {
            value = [value];
        }

        if (!this.memoizedHasSome) {
            this.memoizedHasSome = memoize((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $in: value,
                    },
                });
            })
        }

        this.memoizedHasSome(propertyName, value);
        return this.dataQueryClass;
    }

    private memoizedIsEmpty!: Function;
    /**
     * Refines a query or filter to match items whose specified property does not exist or does not have any value.
     * 
     * @param propertyName The the property in which to check for a value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    isEmpty(propertyName: string): WeivDataQuery {
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = memoize((propertyName) => {
                return this.addFilter({
                    [propertyName]: {
                        $exists: false,
                    },
                });
            })
        }

        this.memoizedIsEmpty(propertyName);
        return this.dataQueryClass;
    }

    private memoizedIsNotEmpty!: Function;
    /**
     * Refines a query or filter to match items whose specified property has any value.
     * 
     * @param propertyName The property in which to check for a value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    isNotEmpty(propertyName: string): WeivDataQuery {
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = memoize((propertyName) => {
                return this.addFilter({
                    [propertyName]: {
                        $exists: true,
                    },
                });
            })
        }

        this.memoizedIsNotEmpty(propertyName);
        return this.dataQueryClass;
    }

    private memoizedLe!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    le(propertyName: string, value: string | number | Date): WeivDataQuery {
        if (!this.memoizedLe) {
            this.memoizedLe = memoize((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $lte: value,
                    },
                });
            })
        }

        this.memoizedLe(propertyName, value);
        return this.dataQueryClass;
    }

    private memoizedLt!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is less than the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    lt(propertyName: string, value: string | number | Date): WeivDataQuery {
        if (!this.memoizedLt) {
            this.memoizedLt = memoize((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $lt: value,
                    },
                });
            })
        }

        this.memoizedLt(propertyName, value);
        return this.dataQueryClass;
    }

    private memoizedNe!: Function;
    /**
     * Refines a query or filter to match items whose specified property value does not equal the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    ne(propertyName: string, value: unknown): WeivDataQuery {
        if (!this.memoizedNe) {
            this.memoizedNe = memoize((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $ne: value,
                    },
                });
            })
        }

        this.memoizedNe(propertyName, value);
        return this.dataQueryClass;
    }

    /**
     * Adds a `not` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as a `not` condition.
     * @returns {WeivDataQueryFilter} A `WeivDataQuery` object representing the refined query.
     */
    not(query: WeivDataQueryFilter): WeivDataQueryFilter {
        this.filters = {
            ...this.filters,
            $nor: [query.filters],
        };
        return this;
    }

    /**
     * Adds an `or` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as an `or` condition.
     * @returns {WeivDataQueryFilter} A `WeivDataQuery` object representing the refined query.
     */
    or(query: WeivDataQueryFilter): WeivDataQueryFilter {
        this.filters = {
            ...this.filters,
            $or: [query.filters],
        };
        return this;
    }

    private memoizedStartsWith!: Function;
    /**
     * Refines a query or filter to match items whose specified property value starts with a specified string.
     * 
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the beginning of the specified property value.
     * @returns {WeivDataQuery} A `WeivDataQuery` object representing the refined query.
     */
    startsWith(propertyName: string, string: string): WeivDataQuery {
        if (!this.memoizedStartsWith) {
            this.memoizedStartsWith = memoize((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: `^${string}`,
                        $options: "i",
                    },
                });
            })
        }

        this.memoizedStartsWith(propertyName, string);
        return this.dataQueryClass;
    }

    // Helpers
    protected setDataQuery(queryClass: WeivDataQuery): void {
        this.dataQueryClass = queryClass;
    }

    private addFilter(newFilter: object) {
        this.filters = merge(this.filters, newFilter);
        return this.filters;
    }
}