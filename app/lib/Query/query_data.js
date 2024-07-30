"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResult = void 0;
const data_filter_1 = require("../Filter/data_filter");
const lodash_1 = require("lodash");
const validator_1 = require("../Helpers/validator");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const weiv_data_config_1 = require("../Config/weiv_data_config");
class Query extends data_filter_1.WeivDataFilter {
    constructor(collectionId) {
        super();
        this._sort = new Map();
        this._fields = new Array();
        this._includes = new Array();
        this._limitNumber = 50;
        this._skipNumber = 0;
        this._isAggregate = false;
        this._collectionId = collectionId;
    }
    ascending(...propertyName) {
        if (!propertyName || !(0, lodash_1.isArray)(propertyName)) {
            (0, error_manager_1.kaptanLogar)("00001", "propertyName is not valid");
        }
        this.__addSort__(1, propertyName);
        return this;
    }
    descending(...propertyName) {
        if (!propertyName || !(0, lodash_1.isArray)(propertyName)) {
            (0, error_manager_1.kaptanLogar)("00001", "propertyName is not valid");
        }
        this.__addSort__(-1, propertyName);
        return this;
    }
    limit(limit) {
        if (typeof limit !== "number") {
            this._limitNumber = this._limitNumber;
        }
        else {
            this._limitNumber = limit;
        }
        return this;
    }
    skip(skip) {
        if (typeof skip !== "number") {
            this._skipNumber = this._skipNumber;
        }
        else {
            this._skipNumber = skip;
        }
        return this;
    }
    fields(...propertyName) {
        if (!propertyName || !(0, lodash_1.isArray)(propertyName)) {
            (0, error_manager_1.kaptanLogar)("00001", "propertyName is not valid");
        }
        for (const name of propertyName) {
            if (typeof name !== "string") {
                (0, error_manager_1.kaptanLogar)("00001", "propertyName is not valid");
            }
            else {
                this._fields.push(name);
            }
        }
        this._isAggregate = true;
        return this;
    }
    include(...includes) {
        if (!includes || !(0, lodash_1.isArray)(includes)) {
            (0, error_manager_1.kaptanLogar)("00001", "include is not valid");
        }
        for (const include of includes) {
            if (typeof include !== "object") {
                (0, error_manager_1.kaptanLogar)("00001", `${include} is not valid`);
            }
            else {
                if (!include["collectionName"] || !include["fieldName"] || typeof include["collectionName"] !== "string" || typeof include["fieldName"] !== "string") {
                    (0, error_manager_1.kaptanLogar)("00001", "each include object must contain collectionName and fieldName values as string");
                }
                const safeInclude = (0, validator_1.copyOwnPropsOnly)(include);
                this._includes.push(safeInclude);
            }
        }
        this._isAggregate = true;
        return this;
    }
    __addSort__(sort, propertyName) {
        for (const name of propertyName) {
            if (typeof name !== "string") {
                (0, error_manager_1.kaptanLogar)("00001", "propertyName doesn't contain valid value/s!");
            }
            else {
                this._sort.set(name, sort);
            }
        }
    }
}
class QueryResult extends Query {
    async count(options) {
        try {
            const { suppressAuth, suppressHooks, readConcern } = (0, validator_1.copyOwnPropsOnly)(options || {});
            await this._handleConnection_(suppressAuth);
            const context = (0, hook_helpers_1.prepareHookContext)(this._collectionId);
            let editedQurey;
            if (suppressHooks != true) {
                editedQurey = await (0, hook_manager_1.runDataHook)(this._collectionId, "beforeCount", [this, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00002", `beforeCount Hook Failure ${err}`);
                });
            }
            const totalCount = await this._collection.countDocuments(!editedQurey ? this._filters.$match : editedQurey._filters.$match, { readConcern });
            if (suppressHooks != true) {
                let editedCount = await (0, hook_manager_1.runDataHook)(this._collectionId, "afterCount", [totalCount, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00003", `afterCount Hook Failure ${err}`);
                });
                if (editedCount) {
                    return editedCount;
                }
            }
            return totalCount;
        }
        catch (err) {
            (0, error_manager_1.kaptanLogar)("00004", `${err}`);
        }
    }
    async distinct(propertyName, options) {
        try {
            if (!propertyName || typeof propertyName !== "string") {
                (0, error_manager_1.kaptanLogar)("00001", `propertyName is not string or not a valid value!`);
            }
            options = options ? { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...(0, validator_1.copyOwnPropsOnly)(options) } : { convertIds: (0, weiv_data_config_1.getConvertIdsValue)() };
            const { suppressAuth, readConcern, convertIds } = options;
            await this._handleConnection_(suppressAuth);
            const pipeline = [];
            if (Object.keys(this._filters.$match).length > 0) {
                pipeline.push(this._filters);
            }
            pipeline.push({ $group: { _id: `$${propertyName}` } });
            pipeline.push({ $project: { distnict: "$_id", _id: 0 } });
            const aggregationCursor = this._collection.aggregate(pipeline, { readConcern });
            const items = (await aggregationCursor.toArray()).map(i => i.distinct);
            const hasNext = await aggregationCursor.hasNext();
            const totalCount = await this.__getTotalCount__(options?.omitTotalCount || false);
            return {
                items: convertIds ? (0, internal_id_converter_1.recursivelyConvertIds)(items) : items,
                length: items.length,
                currentPage: this._currentPage,
                pageSize: this._limitNumber,
                totalCount,
                totalPages: Math.ceil(totalCount / this._limitNumber),
                hasNext: () => hasNext,
                hasPrev: () => this.__hasPrev__(),
                next: async () => {
                    this._currentPage++;
                    return this.distinct(propertyName, options);
                },
                prev: async () => {
                    this._currentPage--;
                    return this.distinct(propertyName, options);
                },
                _filters: this._filters,
                _pipeline: pipeline
            };
        }
        catch (err) {
            (0, error_manager_1.kaptanLogar)("00005", `${err}`);
        }
    }
    async find(options) {
        try {
            options = options ? { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...(0, validator_1.copyOwnPropsOnly)(options) } : { convertIds: (0, weiv_data_config_1.getConvertIdsValue)() };
            const { suppressAuth, suppressHooks, readConcern, omitTotalCount, convertIds } = options;
            await this._handleConnection_(suppressAuth);
            const context = (0, hook_helpers_1.prepareHookContext)(this._collectionId);
            if (suppressHooks != true) {
                await (0, hook_manager_1.runDataHook)(this._collectionId, "beforeQuery", [this, context]).catch((err) => {
                    (0, error_manager_1.kaptanLogar)("00002", `beforeQuery ${err}`);
                });
            }
            let totalCount;
            let items;
            let hasNext;
            if (this._isAggregate) {
                const pipeline = this.__createAggregationPipeline__();
                const aggregationCursor = this._collection.aggregate(pipeline, { readConcern });
                items = await aggregationCursor.toArray();
                hasNext = await aggregationCursor.hasNext();
                totalCount = await this.__getTotalCount__(omitTotalCount || false);
            }
            else {
                const findCursor = this._collection.find(this._filters.$match, { readConcern });
                for (const [key, value] of this._sort.entries()) {
                    findCursor.sort(key, value);
                }
                findCursor.limit(this._limitNumber);
                findCursor.skip(this._skipNumber || 0 + ((this._currentPage - 1) * this._limitNumber));
                items = await findCursor.toArray();
                hasNext = await findCursor.hasNext();
                totalCount = await this.__getTotalCount__(omitTotalCount || false);
            }
            if (suppressHooks != true) {
                const hookedItems = items.map(async (item) => {
                    const editedItem = await (0, hook_manager_1.runDataHook)(this._collectionId, "afterQuery", [convertIds ? (0, internal_id_converter_1.convertDocumentIDs)(item) : item, context]).catch((err) => {
                        (0, error_manager_1.kaptanLogar)("00003", `afterQuery ${err}`);
                    });
                    if (editedItem) {
                        return editedItem;
                    }
                    else {
                        return item;
                    }
                });
                items = await Promise.all(hookedItems);
            }
            return {
                items: convertIds ? (0, internal_id_converter_1.recursivelyConvertIds)(items) : items,
                length: items.length,
                currentPage: this._currentPage,
                pageSize: this._limitNumber,
                totalCount,
                totalPages: Math.ceil(totalCount / this._limitNumber),
                hasNext: () => hasNext,
                hasPrev: () => this.__hasPrev__(),
                next: async () => {
                    this._currentPage++;
                    return this.find(options);
                },
                prev: async () => {
                    this._currentPage--;
                    return this.find(options);
                },
                _filters: this._filters,
                _pipeline: this._isAggregate ? this.__createAggregationPipeline__() : undefined
            };
        }
        catch (err) {
            (0, error_manager_1.kaptanLogar)("00006", `${err}`);
        }
    }
    constructor(collectionId) {
        if (!collectionId || typeof collectionId !== "string") {
            (0, error_manager_1.kaptanLogar)("00007");
        }
        super(collectionId);
        this._currentPage = 1;
    }
    async _handleConnection_(suppressAuth) {
        if (!this._collection || !this._database) {
            const { collection, database } = await (0, connection_helpers_1.connectionHandler)(this._collectionId, suppressAuth);
            this._database = database;
            this._collection = collection;
        }
    }
    __createAggregationPipeline__() {
        const pipeline = [];
        if (!(0, lodash_1.isEmpty)(this._filters.$match)) {
            pipeline.push(this._filters);
        }
        for (const include of this._includes) {
            const lookUpObj = {
                $lookup: {
                    from: include.collectionName,
                    localField: include.fieldName,
                    foreignField: !include.foreignField ? "_id" : include.foreignField,
                    as: !include.as ? include.fieldName : include.as,
                    pipeline: [
                        { $limit: include.maxItems || 50 },
                        { $sort: this.__getSortFromInclude__(include) }
                    ]
                }
            };
            if (include.countItems) {
                pipeline.push({
                    $addFields: {
                        [`${include.fieldName}Length`]: {
                            $cond: {
                                if: { $isArray: `$${include.fieldName}` },
                                then: { $size: `$${include.fieldName}` },
                                else: 0
                            }
                        }
                    }
                });
            }
            pipeline.push(lookUpObj);
        }
        for (const [key, value] of this._sort.entries()) {
            pipeline.push({
                $sort: {
                    [key]: value
                }
            });
        }
        let fields = {};
        for (const field of this._fields) {
            (0, lodash_1.merge)(fields, { [field]: 1 });
        }
        if (!(0, lodash_1.isEmpty)(fields)) {
            pipeline.push({ $project: fields });
        }
        pipeline.push({ $skip: this._skipNumber || 0 + ((this._currentPage - 1) * this._limitNumber) });
        pipeline.push({ $limit: this._limitNumber || 50 });
        return pipeline;
    }
    __getSortFromInclude__(includeObj) {
        if (includeObj.sort) {
            return (0, validator_1.copyOwnPropsOnly)(includeObj.sort);
        }
        else {
            return { _createdDate: 1 };
        }
    }
    __hasPrev__() {
        return this._currentPage > 1;
    }
    async __getTotalCount__(omitTotalCount) {
        if (omitTotalCount) {
            return await this._collection.estimatedDocumentCount();
        }
        else {
            return await this._collection.countDocuments();
        }
    }
}
exports.QueryResult = QueryResult;
