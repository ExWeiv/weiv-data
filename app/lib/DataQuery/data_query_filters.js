"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQueryFilter = void 0;
const lodash_1 = require("lodash");
class DataQueryFilter {
    constructor() {
        this.filters = {};
    }
    and(query) {
        this.filters = (0, lodash_1.merge)(this.filters, query.filters);
        return this;
    }
    between(propertyName, rangeStart, rangeEnd) {
        if (!this.memoizedBetween) {
            this.memoizedBetween = (0, lodash_1.memoize)((propertyName, rangeStart, rangeEnd) => {
                return this.addFilter({
                    [propertyName]: {
                        $gte: rangeStart,
                        $lte: rangeEnd,
                    },
                });
            });
        }
        this.memoizedBetween(propertyName, rangeStart, rangeEnd);
        return this.dataQueryClass;
    }
    contains(propertyName, string) {
        if (!this.memoizedContains) {
            this.memoizedContains = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: string,
                        $options: "i",
                    },
                });
            });
        }
        this.memoizedContains(propertyName, string);
        return this.dataQueryClass;
    }
    endsWith(propertyName, string) {
        if (!this.memoizedEndsWith) {
            this.memoizedEndsWith = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: `${string}$`,
                        $options: "i",
                    },
                });
            });
        }
        this.memoizedEndsWith(propertyName, string);
        return this.dataQueryClass;
    }
    eq(propertyName, value) {
        if (!this.memoizedEq) {
            this.memoizedEq = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: value,
                });
            });
        }
        this.memoizedEq(propertyName, value);
        return this.dataQueryClass;
    }
    ge(propertyName, value) {
        if (!this.memoizedGe) {
            this.memoizedGe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $gte: value,
                    },
                });
            });
        }
        this.memoizedGe(propertyName, value);
        return this.dataQueryClass;
    }
    gt(propertyName, value) {
        if (!this.memoizedGt) {
            this.memoizedGt = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $gt: value,
                    },
                });
            });
        }
        this.memoizedGt(propertyName, value);
        return this.dataQueryClass;
    }
    hasAll(propertyName, value) {
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!this.memoizedHasAll) {
            this.memoizedHasAll = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $all: value,
                    },
                });
            });
        }
        this.memoizedHasAll(propertyName, value);
        return this.dataQueryClass;
    }
    hasSome(propertyName, value) {
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!this.memoizedHasSome) {
            this.memoizedHasSome = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $in: value,
                    },
                });
            });
        }
        this.memoizedHasSome(propertyName, value);
        return this.dataQueryClass;
    }
    isEmpty(propertyName) {
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter({
                    [propertyName]: {
                        $exist: true,
                    },
                });
            });
        }
        this.memoizedIsEmpty(propertyName);
        return this.dataQueryClass;
    }
    isNotEmpty(propertyName) {
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter({
                    [propertyName]: {
                        $exist: false,
                    },
                });
            });
        }
        this.memoizedIsNotEmpty(propertyName);
        return this.dataQueryClass;
    }
    le(propertyName, value) {
        if (!this.memoizedLe) {
            this.memoizedLe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $lte: value,
                    },
                });
            });
        }
        this.memoizedLe(propertyName, value);
        return this.dataQueryClass;
    }
    lt(propertyName, value) {
        if (!this.memoizedLt) {
            this.memoizedLt = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $lt: value,
                    },
                });
            });
        }
        this.memoizedLt(propertyName, value);
        return this.dataQueryClass;
    }
    ne(propertyName, value) {
        if (!this.memoizedNe) {
            this.memoizedNe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter({
                    [propertyName]: {
                        $ne: value,
                    },
                });
            });
        }
        this.memoizedNe(propertyName, value);
        return this.dataQueryClass;
    }
    not(query) {
        this.filters = {
            ...this.filters,
            $nor: [query.filters],
        };
        return this;
    }
    or(query) {
        this.filters = {
            ...this.filters,
            $or: [query.filters],
        };
        return this;
    }
    startsWith(propertyName, string) {
        if (!this.memoizedStartsWith) {
            this.memoizedStartsWith = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter({
                    [propertyName]: {
                        $regex: `^${string}`,
                        $options: "i",
                    },
                });
            });
        }
        this.memoizedStartsWith(propertyName, string);
        return this.dataQueryClass;
    }
    setDataQuery(queryClass) {
        this.dataQueryClass = queryClass;
    }
    addFilter(newFilter) {
        this.filters = (0, lodash_1.merge)(this.filters, newFilter);
        return this.filters;
    }
}
exports.DataQueryFilter = DataQueryFilter;
