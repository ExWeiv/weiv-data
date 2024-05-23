"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeivDataFilter = void 0;
const lodash_1 = require("lodash");
const item_helpers_1 = require("../Helpers/item_helpers");
const validator_1 = require("../Helpers/validator");
class WeivDataFilter {
    constructor() {
        this.filters = {};
    }
    and(query) {
        if (!query) {
            throw new Error(`WeivData - query parameter must be valid to work with and method!`);
        }
        if (!this.filters["$and"]) {
            this.filters["$and"] = [];
        }
        this.filters["$and"].push((0, validator_1.copyOwnPropsOnly)(query.filters));
        return this;
    }
    between(propertyName, rangeStart, rangeEnd) {
        if (!propertyName || typeof propertyName !== "string" || !rangeStart || !rangeEnd) {
            throw new Error(`WeivData - propertyName, rangeStart and rangeEnd must have valid values to work with between method!`);
        }
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
        if (!propertyName || !string || typeof (propertyName || string) !== "string") {
            throw new Error(`WeivData - propertyName and string parameter must be valid to work with contains method!`);
        }
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
        if (!propertyName || !string || typeof (propertyName || string) !== "string") {
            throw new Error(`WeivData - propertyName and string parameter must be valid to work with endsWith method!`);
        }
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
        if (!propertyName || !value || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName and value parameter must be valid to work with eq method!`);
        }
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
        if (!propertyName || !value || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName and value parameter must be valid to work with ge method!`);
        }
        if (!this.memoizedGe) {
            this.memoizedGe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $gte: value });
            });
        }
        this.memoizedGe(propertyName, value);
        return this;
    }
    gt(propertyName, value) {
        if (!propertyName || !value || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName and value parameter must be valid to work with gt method!`);
        }
        if (!this.memoizedGt) {
            this.memoizedGt = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $gt: value });
            });
        }
        this.memoizedGt(propertyName, value);
        return this;
    }
    hasAll(propertyName, value) {
        if (!propertyName || !value || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName and value parameter must be valid to work with hasAll method!`);
        }
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!this.memoizedHasAll) {
            this.memoizedHasAll = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $all: value });
            });
        }
        this.memoizedHasAll(propertyName, value);
        return this;
    }
    hasSome(propertyName, value) {
        if (!propertyName || !value || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName and value parameter must be valid to work with hasSome method!`);
        }
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!this.memoizedHasSome) {
            this.memoizedHasSome = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $in: value });
            });
        }
        this.memoizedHasSome(propertyName, value);
        return this;
    }
    isEmpty(propertyName) {
        if (!propertyName || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName parameter must be valid to work with isEmpty method!`);
        }
        if (!this.memoizedIsEmpty) {
            this.memoizedIsEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter(propertyName, { $exists: false });
            });
        }
        this.memoizedIsEmpty(propertyName);
        return this;
    }
    isNotEmpty(propertyName) {
        if (!propertyName || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName parameter must be valid to work with isNotEmpty method!`);
        }
        if (!this.memoizedIsNotEmpty) {
            this.memoizedIsNotEmpty = (0, lodash_1.memoize)((propertyName) => {
                return this.addFilter(propertyName, { $exists: true });
            });
        }
        this.memoizedIsNotEmpty(propertyName);
        return this;
    }
    le(propertyName, value) {
        if (!propertyName || !value || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName and value parameter must be valid to work with le method!`);
        }
        if (!this.memoizedLe) {
            this.memoizedLe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $lte: value });
            });
        }
        this.memoizedLe(propertyName, value);
        return this;
    }
    lt(propertyName, value) {
        if (!propertyName || !value || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName and value parameter must be valid to work with lt method!`);
        }
        if (!this.memoizedLt) {
            this.memoizedLt = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $lt: value });
            });
        }
        this.memoizedLt(propertyName, value);
        return this;
    }
    ne(propertyName, value) {
        if (!propertyName || !value || typeof propertyName !== "string") {
            throw new Error(`WeivData - propertyName and value parameter must be valid to work with ne method!`);
        }
        if (!this.memoizedNe) {
            this.memoizedNe = (0, lodash_1.memoize)((propertyName, value) => {
                return this.addFilter(propertyName, { $ne: value });
            });
        }
        this.memoizedNe(propertyName, value);
        return this;
    }
    not(query) {
        if (!query) {
            throw new Error(`WeivData - query parameter must be valid to work with not method!`);
        }
        if (!this.filters["$nor"]) {
            this.filters["$nor"] = [];
        }
        this.filters["$nor"].push((0, validator_1.copyOwnPropsOnly)(query.filters));
        return this;
    }
    or(query) {
        if (!query) {
            throw new Error(`WeivData - query parameter must be valid to work with or method!`);
        }
        if (!this.filters["$or"]) {
            this.filters["$or"] = [];
        }
        this.filters["$or"].push((0, validator_1.copyOwnPropsOnly)(query.filters));
        return this;
    }
    startsWith(propertyName, string) {
        if (!propertyName || !string || typeof (propertyName || string) !== "string") {
            throw new Error(`WeivData - propertyName and string parameter must be valid to work with startsWith method!`);
        }
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
        this.sanitizeFilters(newFilter);
        this.filters[propertyName] = {
            ...this.filters[propertyName],
            ...newFilter
        };
        return this.filters;
    }
    sanitizeFilters(filters) {
        for (const key of Object.getOwnPropertyNames(filters)) {
            if (key === "__proto__" || key === "constructor" || key === "prototype") {
                throw new Error(`Invalid filter key: ${key}`);
            }
            if (typeof filters[key] === 'object' && filters[key] !== null) {
                this.sanitizeFilters(filters[key]);
            }
        }
    }
    get _filters() {
        const copyFilters = (0, validator_1.copyOwnPropsOnly)(this.filters);
        return {
            $match: {
                ...copyFilters
            }
        };
    }
}
exports.WeivDataFilter = WeivDataFilter;
