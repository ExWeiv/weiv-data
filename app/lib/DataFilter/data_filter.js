"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExWeivDataFilter = exports.DataFilter = void 0;
const lodash_1 = require("lodash");
const item_helpers_1 = require("../Helpers/item_helpers");
class DataFilter {
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
        return this;
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
        return this;
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
        return this;
    }
    eq(propertyName, value) {
        if (!this.memoizedEq) {
            this.memoizedEq = (0, lodash_1.memoize)((propertyName, value) => {
                if (propertyName === "_id") {
                    return this.addFilter({
                        [propertyName]: (0, item_helpers_1.convertStringId)(value),
                    });
                }
                return this.addFilter({
                    [propertyName]: value,
                });
            });
        }
        this.memoizedEq(propertyName, value);
        return this;
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
        return this;
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
        return this;
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
        return this;
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
        return this;
    }
    isEmpty(propertyName) {
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter({
                    [propertyName]: {
                        $exists: false,
                    },
                });
            });
        }
        this.memoizedIsEmpty(propertyName);
        return this;
    }
    isNotEmpty(propertyName) {
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter({
                    [propertyName]: {
                        $exists: true,
                    },
                });
            });
        }
        this.memoizedIsNotEmpty(propertyName);
        return this;
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
        return this;
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
        return this;
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
        return this;
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
        return this;
    }
    addFilter(newFilter) {
        this.filters = (0, lodash_1.merge)(this.filters, newFilter);
        return this.filters;
    }
}
exports.DataFilter = DataFilter;
function ExWeivDataFilter() {
    return new DataFilter();
}
exports.ExWeivDataFilter = ExWeivDataFilter;
