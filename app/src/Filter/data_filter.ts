import { memoize } from 'lodash';
import { convertStringId } from '../Helpers/item_helpers';
import type { Document } from 'mongodb/mongodb';

export class WeivDataFilter {
    private filters: { [key: string]: any } = {};
    constructor() { }

    and(query: WeivDataFilter): WeivDataFilter {
        if (!this.filters["$and"]) {
            this.filters["$and"] = [];
        }
        this.filters["$and"].push(query.filters);
        return this;
    }

    private memoizedBetween!: Function;
    between(propertyName: string, rangeStart: any, rangeEnd: any): WeivDataFilter {
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
    contains(propertyName: string, string: string): WeivDataFilter {
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
    endsWith(propertyName: string, string: string): WeivDataFilter {
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
    eq(propertyName: string, value: any): WeivDataFilter {
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
    ge(propertyName: string, value: any): WeivDataFilter {
        if (!this.memoizedGe) {
            this.memoizedGe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $gte: value, });
            })
        }
        this.memoizedGe(propertyName, value);
        return this;
    }

    private memoizedGt!: Function;
    gt(propertyName: string, value: any): WeivDataFilter {
        if (!this.memoizedGt) {
            this.memoizedGt = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $gt: value, });
            })
        }
        this.memoizedGt(propertyName, value);
        return this;
    }

    private memoizedHasAll!: Function;
    hasAll(propertyName: string, value: any): WeivDataFilter {
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
    hasSome(propertyName: string, value: any): WeivDataFilter {
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
    isEmpty(propertyName: string): WeivDataFilter {
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = memoize((propertyName) => {
                return this.addFilter(propertyName, { $exists: false, });
            })
        }
        this.memoizedIsEmpty(propertyName);
        return this;
    }

    private memoizedIsNotEmpty!: Function;
    isNotEmpty(propertyName: string): WeivDataFilter {
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = memoize((propertyName) => {
                return this.addFilter(propertyName, { $exists: true, });
            })
        }
        this.memoizedIsNotEmpty(propertyName);
        return this;
    }

    private memoizedLe!: Function;
    le(propertyName: string, value: any): WeivDataFilter {
        if (!this.memoizedLe) {
            this.memoizedLe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $lte: value, });
            })
        }
        this.memoizedLe(propertyName, value);
        return this;
    }

    private memoizedLt!: Function;
    lt(propertyName: string, value: any): WeivDataFilter {
        if (!this.memoizedLt) {
            this.memoizedLt = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $lt: value, });
            })
        }
        this.memoizedLt(propertyName, value);
        return this;
    }

    private memoizedNe!: Function;
    ne(propertyName: string, value: any): WeivDataFilter {
        if (!this.memoizedNe) {
            this.memoizedNe = memoize((propertyName, value) => {
                return this.addFilter(propertyName, { $ne: value, });
            })
        }
        this.memoizedNe(propertyName, value);
        return this;
    }

    not(query: WeivDataFilter): WeivDataFilter {
        if (!this.filters["$nor"]) {
            this.filters["$nor"] = [];
        }
        this.filters["$nor"].push(query.filters);
        return this;
    }

    or(query: WeivDataFilter): WeivDataFilter {
        if (!this.filters["$or"]) {
            this.filters["$or"] = [];
        }
        this.filters["$or"].push(query.filters);
        return this;
    }

    private memoizedStartsWith!: Function;
    startsWith(propertyName: string, string: string): WeivDataFilter {
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

    // HELPER FUNCTIONS
    private addFilter(propertyName: string, newFilter: { [key: string]: any }) {
        this.filters[propertyName] = {
            ...this.filters[propertyName],
            ...newFilter
        }
        return this.filters;
    }

    get _filters(): { $match: Document } {
        return {
            $match: {
                ...this.filters
            }
        }
    }
}