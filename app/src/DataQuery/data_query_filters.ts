import { DataQueryFilterInterface } from '../Interfaces/interfaces'
import { memoize, merge } from 'lodash';
import { DataQuery } from './data_query';
import { convertStringId } from '../Helpers/item_helpers';

export class DataQueryFilter implements DataQueryFilterInterface {
    protected filters: QueryFilters = {};
    private dataQueryClass!: DataQuery;

    constructor() { }

    and(query: DataQueryFilter): DataQueryFilter {
        this.filters = merge(query.filters, this.filters);
        return this;
    }

    private memoizedBetween!: Function;
    between(propertyName: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): DataQuery {
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
    contains(propertyName: string, string: string): DataQuery {
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
    endsWith(propertyName: string, string: string): DataQuery {
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
    eq(propertyName: string, value: unknown): DataQuery {
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
    ge(propertyName: string, value: string | number | Date): DataQuery {
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
    gt(propertyName: string, value: string | number | Date): DataQuery {
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
    hasAll(propertyName: string, value: string | number | Date | [unknown]): DataQuery {
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
    hasSome(propertyName: string, value: string | number | Date | [unknown]): DataQuery {
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
    isEmpty(propertyName: string): DataQuery {
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
    isNotEmpty(propertyName: string): DataQuery {
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
    le(propertyName: string, value: string | number | Date): DataQuery {
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
    lt(propertyName: string, value: string | number | Date): DataQuery {
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
    ne(propertyName: string, value: unknown): DataQuery {
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

    not(query: DataQueryFilter): DataQueryFilter {
        this.filters = {
            ...this.filters,
            $nor: [query.filters],
        };
        return this;
    }

    or(query: DataQueryFilter): DataQueryFilter {
        this.filters = {
            ...this.filters,
            $or: [query.filters],
        };
        return this;
    }

    private memoizedStartsWith!: Function;
    startsWith(propertyName: string, string: string): DataQuery {
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
    protected setDataQuery(queryClass: DataQuery): void {
        this.dataQueryClass = queryClass;
    }

    private addFilter(newFilter: object) {
        this.filters = merge(this.filters, newFilter);
        return this.filters;
    }
}