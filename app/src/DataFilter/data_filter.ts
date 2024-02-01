import { DataFilterInterface } from '../Interfaces/interfaces'
import { memoize, merge } from 'lodash';
import { convertStringId } from '../Helpers/item_helpers';

export class DataFilter implements DataFilterInterface {
    filters = {};
    constructor() { }

    /**
     * @description Adds an `and` condition to the query or filter.
     * @param query A query to add to the initial query as an `and` condition.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    and(query: DataFilter): DataFilter {
        this.filters = merge(this.filters, query.filters)
        return this;
    }

    private memoizedBetween!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value is within a specified range.
     * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
     * @param rangeStart The beginning value of the range to match against.
     * @param rangeEnd The ending value of the range to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    between(propertyName: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): DataFilter {
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
        return this;
    }

    private memoizedContains!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value contains a specified string.
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for inside the specified property value.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    contains(propertyName: string, string: string): DataFilter {
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
        return this;
    }

    private memoizedEndsWith!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value ends with a specified string.
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the end of the specified property value.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    endsWith(propertyName: string, string: string): DataFilter {
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
        return this;
    }

    private memoizedEq!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value equals the specified value.
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    eq(propertyName: string, value: unknown): DataFilter {
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
        return this;
    }

    private memoizedGe!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    ge(propertyName: string, value: string | number | Date): DataFilter {
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
        return this;
    }

    private memoizedGt!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value is greater than the specified value.
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    gt(propertyName: string, value: string | number | Date): DataFilter {
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
        return this;
    }

    private memoizedHasAll!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property values equals all of the specified `value` parameters.
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    hasAll(propertyName: string, value: string | number | Date | [unknown]): DataFilter {
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
        return this;
    }

    private memoizedHasSome!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    hasSome(propertyName: string, value: string | number | Date | [unknown]): DataFilter {
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
        return this;
    }

    private memoizedIsEmpty!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property does not exist or does not have any value.
     * @param propertyName The the property in which to check for a value.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    isEmpty(propertyName: string): DataFilter {
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
        return this;
    }

    private memoizedIsNotEmpty!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property has any value.
     * @param propertyName The property in which to check for a value.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    isNotEmpty(propertyName: string): DataFilter {
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
        return this;
    }

    private memoizedLe!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    le(propertyName: string, value: string | number | Date): DataFilter {
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
        return this;
    }

    private memoizedLt!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value is less than the specified value.
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    lt(propertyName: string, value: string | number | Date): DataFilter {
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
        return this;
    }

    private memoizedNe!: Function;
    /**
     * @description Refines a query or filter to match items whose specified property value does not equal the specified value.
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    ne(propertyName: string, value: unknown): DataFilter {
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
        return this;
    }

    /**
     * @description Adds a `not` condition to the query or filter.
     * @param query A query to add to the initial query as a `not` condition.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    not(query: DataFilter): DataFilter {
        this.filters = {
            ...this.filters,
            $nor: [query.filters],
        };
        return this;
    }

    /**
     * @description Adds an `or` condition to the query or filter.
     * @param query A query to add to the initial query as an `or` condition.
     * @returns A `WeivDataQuery` object representing the refined query.
     */
    or(query: DataFilter): DataFilter {
        this.filters = {
            ...this.filters,
            $or: [query.filters],
        };
        return this;
    }

    private memoizedStartsWith!: Function;
    startsWith(propertyName: string, string: string): DataFilter {
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
        return this;
    }

    private addFilter(newFilter: object) {
        this.filters = merge(this.filters, newFilter);
        return this.filters;
    }
}