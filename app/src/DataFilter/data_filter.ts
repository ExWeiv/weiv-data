import { DataFilterInterface } from '../Interfaces/interfaces'
import { memoize, merge } from 'lodash';

export class DataFilter implements DataFilterInterface {
    filters = {};
    constructor() { }

    and(query: DataFilter): DataFilter {
        this.filters = merge(this.filters, query.filters)
        return this;
    }

    private memoizedBetween!: Function;
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
    eq(propertyName: string, value: unknown): DataFilter {
        if (!this.memoizedEq) {
            this.memoizedEq = memoize((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: value,
                });
            })
        }

        this.memoizedEq(propertyName, value);
        return this;
    }

    private memoizedGe!: Function;
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

    not(query: DataFilter): DataFilter {
        this.filters = {
            ...this.filters,
            $nor: [query.filters],
        };
        return this;
    }

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

export function ExWeivDataFilter() {
    return new DataFilter();
}