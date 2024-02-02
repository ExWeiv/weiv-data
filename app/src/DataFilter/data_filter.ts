import { memoize, merge } from 'lodash';
import { convertStringId } from '../Helpers/item_helpers';

export class WeivDataFilter {
    /** @internal */
    filters = {};

    /** @internal */
    constructor() { }

    /**
     * Adds an `and` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as an `and` condition.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    and(query: WeivDataFilter): WeivDataFilter {
        this.filters = merge(this.filters, query.filters)
        return this;
    }

    private memoizedBetween!: Function;
    /**
     * Refines a query or filter to match items whose specified property value is within a specified range.
     * 
     * @param propertyName The property whose value will be compared with `rangeStart` and `rangeEnd`.
     * @param rangeStart The beginning value of the range to match against.
     * @param rangeEnd The ending value of the range to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    between(propertyName: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value contains a specified string.
     * 
     * @param propertyName 
     * @param string 
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    contains(propertyName: string, string: string): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value ends with a specified string.
     * 
     * @param propertyName The property whose value will be compared with the string.
     * @param string The string to look for at the end of the specified property value.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    endsWith(propertyName: string, string: string): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value equals the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    eq(propertyName: string, value: any): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value is greater than or equal to the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    ge(propertyName: string, value: string | number | Date): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value is greater than the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    gt(propertyName: string, value: string | number | Date): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property values equals all of the specified `value` parameters.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    hasAll(propertyName: string, value: string | number | Date | [any]): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value equals any of the specified `value` parameters.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The values to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    hasSome(propertyName: string, value: string | number | Date | [any]): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property does not exist or does not have any value.
     * 
     * @param propertyName The the property in which to check for a value.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    isEmpty(propertyName: string): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property has any value.
     * 
     * @param propertyName The property in which to check for a value.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    isNotEmpty(propertyName: string): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value is less than or equal to the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    le(propertyName: string, value: string | number | Date): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value is less than the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    lt(propertyName: string, value: string | number | Date): WeivDataFilter {
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
     * Refines a query or filter to match items whose specified property value does not equal the specified value.
     * 
     * @param propertyName The property whose value will be compared with `value`.
     * @param value The value to match against.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    ne(propertyName: string, value: any): WeivDataFilter {
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
     * Adds a `not` condition to the query or filter.
     * 
     * @param query A query to add to the initial query as a `not` condition.
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    not(query: WeivDataFilter): WeivDataFilter {
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
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    or(query: WeivDataFilter): WeivDataFilter {
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
     * @returns {WeivDataFilter} A `WeivDataFilter` object representing the refined filters.
     */
    startsWith(propertyName: string, string: string): WeivDataFilter {
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

    /** @internal */
    private addFilter(newFilter: object) {
        this.filters = merge(this.filters, newFilter);
        return this.filters;
    }
}