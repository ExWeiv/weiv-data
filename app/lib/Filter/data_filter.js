"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeivDataFilter = void 0;
const lodash_1 = require("lodash");
const item_helpers_1 = require("../Helpers/item_helpers");
class WeivDataFilter {
    constructor() {
        this.filters = {};
    }
    and(query) {
        if (!this.filters["$and"]) {
            this.filters["$and"] = [];
        }
        this.filters["$and"].push(query.filters);
        return this;
    }
    between(propertyName, rangeStart, rangeEnd) {
        if (!this.memoizedBetween) {
            this.memoizedBetween = (0, lodash_1.memoize)((propertyName, rangeStart, rangeEnd) => {
                return this.addFilter(propertyName, {
                    $gte: rangeStart,
                    $lte: rangeEnd,
                });
            });
        }
        this.memoizedBetween(propertyName, rangeStart, rangeEnd);
        return this;
    }
    contains(propertyName, string) {
        if (!this.memoizedContains) {
            this.memoizedContains = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: string,
                    $options: "i",
                });
            });
        }
        this.memoizedContains(propertyName, string);
        return this;
    }
    endsWith(propertyName, string) {
        if (!this.memoizedEndsWith) {
            this.memoizedEndsWith = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: `${string}$`,
                    $options: "i",
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
                    return this.addFilter(propertyName, {
                        $eq: (0, item_helpers_1.convertStringId)(value),
                    });
                }
                return this.addFilter(propertyName, {
                    $eq: value,
                });
            });
        }
        this.memoizedEq(propertyName, value);
        return this;
    }
    ge(propertyName, value) {
        if (!this.memoizedGe) {
            this.memoizedGe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $gte: value, });
            });
        }
        this.memoizedGe(propertyName, value);
        return this;
    }
    gt(propertyName, value) {
        if (!this.memoizedGt) {
            this.memoizedGt = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $gt: value, });
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
                return this.addFilter(propertyName, { $all: value, });
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
                return this.addFilter(propertyName, { $in: value, });
            });
        }
        this.memoizedHasSome(propertyName, value);
        return this;
    }
    isEmpty(propertyName) {
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter(propertyName, { $exists: false, });
            });
        }
        this.memoizedIsEmpty(propertyName);
        return this;
    }
    isNotEmpty(propertyName) {
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter(propertyName, { $exists: true, });
            });
        }
        this.memoizedIsNotEmpty(propertyName);
        return this;
    }
    le(propertyName, value) {
        if (!this.memoizedLe) {
            this.memoizedLe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $lte: value, });
            });
        }
        this.memoizedLe(propertyName, value);
        return this;
    }
    lt(propertyName, value) {
        if (!this.memoizedLt) {
            this.memoizedLt = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $lt: value, });
            });
        }
        this.memoizedLt(propertyName, value);
        return this;
    }
    ne(propertyName, value) {
        if (!this.memoizedNe) {
            this.memoizedNe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $ne: value, });
            });
        }
        this.memoizedNe(propertyName, value);
        return this;
    }
    not(query) {
        if (!this.filters["$nor"]) {
            this.filters["$nor"] = [];
        }
        this.filters["$nor"].push(query.filters);
        return this;
    }
    or(query) {
        if (!this.filters["$or"]) {
            this.filters["$or"] = [];
        }
        this.filters["$or"].push(query.filters);
        return this;
    }
    startsWith(propertyName, string) {
        if (!this.memoizedStartsWith) {
            this.memoizedStartsWith = (0, lodash_1.memoize)((propertyName, string) => {
                return this.addFilter(propertyName, {
                    $regex: `^${string}`,
                    $options: "i",
                });
            });
        }
        this.memoizedStartsWith(propertyName, string);
        return this;
    }
    addFilter(propertyName, newFilter) {
        this.filters[propertyName] = {
            ...this.filters[propertyName],
            ...newFilter
        };
        return this.filters;
    }
    get _filters() {
        return {
            $match: {
                ...this.filters
            }
        };
    }
}
exports.WeivDataFilter = WeivDataFilter;
