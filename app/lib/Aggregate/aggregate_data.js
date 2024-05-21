"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateResult = void 0;
const lodash_1 = require("lodash");
const validator_1 = require("../Helpers/validator");
const mongodb_1 = require("mongodb");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const item_helpers_1 = require("../Helpers/item_helpers");
class Aggregate {
    constructor(collectionId) {
        this._pipeline = new Array();
        this._limitNumber = 50;
        this._skipNumber = 0;
        this._collectionId = collectionId;
    }
    filter(filter) {
        if (!filter || typeof filter !== "object") {
            throw new Error(`WeivData - Filter is empty, please add a filter using weivData.filter method! (filter undefined or not valid)`);
        }
        else {
            const filterClass = (0, validator_1.copyOwnPropsOnly)(filter);
            const filters = (0, validator_1.copyOwnPropsOnly)(filterClass._filters);
            this._pipeline.push(filters);
            return this;
        }
    }
    ascending(...propertyName) {
        return this._addSort_(propertyName, 1);
    }
    descending(...propertyName) {
        return this._addSort_(propertyName, -1);
    }
    group(...propertyName) {
        if (!propertyName || !(0, lodash_1.isArray)(propertyName)) {
            throw new Error(`WeivData - At least one group property name is required! (propertyName is undefined or not valid)`);
        }
        else {
            const groups = {};
            for (const name of propertyName) {
                if (typeof name === "string") {
                    groups[name] = `$${name}`;
                }
                else {
                    throw new Error(`WeivData - Property names must be a string, propertyName value is not valid!`);
                }
            }
            let currentGroupStage = this._pipeline.filter(stage => "$group" in stage)[0];
            if (currentGroupStage) {
                currentGroupStage = {
                    "$group": {
                        ...currentGroupStage["$group"],
                        _id: {
                            ...groups
                        }
                    }
                };
            }
            else {
                currentGroupStage = {
                    "$group": {
                        _id: {
                            ...groups
                        }
                    }
                };
            }
            this._pipeline = this._pipeline.filter(stage => !("$group" in stage));
            this._pipeline.push(currentGroupStage);
            return this;
        }
    }
    limit(limit) {
        if (typeof limit !== "number") {
            throw new Error(`WeivData - Unvalid value for limit it's either undefined or not a number!`);
        }
        else {
            this._limitNumber = limit;
            return this;
        }
    }
    skip(skip) {
        if (typeof skip !== "number") {
            throw new Error(`WeivData - Unvalid value for skip it's either undefined or not a number!`);
        }
        else {
            this._skipNumber = skip;
            return this;
        }
    }
    avg(propertyName, projectedName) {
        return this._addCalculation_(propertyName, `${!projectedName ? propertyName + "Avg" : projectedName}`, "$avg");
    }
    count() {
        this._pipeline = this._pipeline.map((stage) => {
            if (stage["$group"]) {
                if (!stage["$group"]["count"]) {
                    return {
                        "$group": {
                            ...stage["$group"],
                            count: {
                                "$sum": 1
                            }
                        }
                    };
                }
            }
            return stage;
        });
        return this;
    }
    max(propertyName, projectedName) {
        return this._addCalculation_(propertyName, `${!projectedName ? propertyName + "Max" : projectedName}`, "$max");
    }
    min(propertyName, projectedName) {
        return this._addCalculation_(propertyName, `${!projectedName ? propertyName + "Min" : projectedName}`, "$min");
    }
    sum(propertyName, projectedName) {
        return this._addCalculation_(propertyName, `${!projectedName ? propertyName + "Sum" : projectedName}`, "$sum");
    }
    stage(...stages) {
        if (!stages || !(0, lodash_1.isArray)(stages)) {
            throw new Error(`WeivData - Stage must be a valid stage!`);
        }
        else {
            for (const stage of stages) {
                const safeStage = (0, validator_1.copyOwnPropsOnly)(stage);
                this._pipeline.push(safeStage);
            }
            return this;
        }
    }
    _addSort_(propertyName, type) {
        if (!propertyName || !(0, lodash_1.isArray)(propertyName)) {
            throw new Error(`WeivData - At least one property name is required! (propertyName is undefined or not valid)`);
        }
        else {
            const sort = {
                "$sort": {}
            };
            for (const name of propertyName) {
                if (typeof name === "string") {
                    sort["$sort"] = {
                        ...sort["$sort"],
                        [name]: type
                    };
                }
                else {
                    throw new Error(`WeivData - Property names must be a string, propertyName value is not valid!`);
                }
            }
            this._pipeline.push(sort);
            return this;
        }
    }
    _addCalculation_(propertyName, projectedName, type) {
        if (!propertyName || typeof propertyName !== "string" || typeof projectedName !== "string") {
            throw new Error(`WeivData - Unvalid value for propertyName projectedName or it's either undefined or not a string!`);
        }
        else {
            let currentGroupStage = this._pipeline.filter(stage => "$group" in stage)[0];
            if (currentGroupStage) {
                currentGroupStage = {
                    "$group": {
                        _id: null,
                        ...currentGroupStage["$group"],
                        [projectedName]: {
                            [type]: `$${propertyName}`
                        }
                    }
                };
            }
            else {
                currentGroupStage = {
                    "$group": {
                        _id: null,
                        [projectedName]: {
                            [type]: `$${propertyName}`
                        }
                    }
                };
            }
            this._pipeline = this._pipeline.filter((stage) => {
                return !stage["$group"];
            });
            this._pipeline.push(currentGroupStage);
            return this;
        }
    }
}
class AggregateResult extends Aggregate {
    async run(options) {
        try {
            const { readConcern, suppressAuth } = options || {};
            await this._handleConnection_(suppressAuth);
            const pipeline = [...this._pipeline];
            this._pageSize = this._limitNumber || 50;
            const skip = { $skip: this._skipNumber || 0 + ((this._currentPage - 1) * this._pageSize) };
            const limit = { $limit: this._pageSize };
            pipeline.push(skip);
            pipeline.push(limit);
            const items = await this._collection.aggregate(pipeline, { readConcern }).toArray();
            const length = items.length;
            const hasNext = () => this._currentPage * this._pageSize < items.length;
            const next = async () => {
                try {
                    this._currentPage++;
                    return await this.run(options);
                }
                catch (err) {
                    throw new Error(`WeivData - Couldn't get the next page of the items!`);
                }
            };
            return {
                items: items.map((item) => {
                    if (mongodb_1.ObjectId.isValid(item._id)) {
                        item._id = (0, item_helpers_1.convertObjectId)(item._id);
                    }
                    return item;
                }),
                length,
                hasNext,
                next,
                pipeline
            };
        }
        catch (err) {
            throw new Error(`WeivData - An error occured when running the aggregation pipeline! Pipeline: ${this._pipeline}, Details: ${err}`);
        }
    }
    constructor(collectionId) {
        if (!collectionId || typeof collectionId !== "string") {
            throw new Error(`WeivData - CollectionID must be string and shouldn't be undefined or null!`);
        }
        super(collectionId);
        this._pageSize = 50;
        this._currentPage = 1;
    }
    async _handleConnection_(suppressAuth) {
        if (!this._collection || !this._database) {
            const { collection, database } = await (0, connection_helpers_1.connectionHandler)(this._collectionId, suppressAuth);
            this._database = database;
            this._collection = collection;
        }
    }
}
exports.AggregateResult = AggregateResult;
