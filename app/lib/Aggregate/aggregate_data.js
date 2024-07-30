"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateResult = void 0;
const lodash_1 = require("lodash");
const validator_1 = require("../Helpers/validator");
const connection_helpers_1 = require("../Helpers/connection_helpers");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const error_manager_1 = require("../Errors/error_manager");
const weiv_data_config_1 = require("../Config/weiv_data_config");
class Aggregate {
    constructor(collectionId) {
        this._pipeline = new Array();
        this._limitNumber = 50;
        this._skipNumber = 0;
        this._collectionId = collectionId;
    }
    filter(filter) {
        try {
            if (!filter || typeof filter !== "object") {
                (0, error_manager_1.kaptanLogar)("00023", `filter is empty, please add a filter using weivData.filter method! (filter undefined or not valid)`);
            }
            else {
                const filters = (0, validator_1.copyOwnPropsOnly)(filter._filters);
                this._pipeline.push(filters);
                return this;
            }
        }
        catch (err) {
            (0, error_manager_1.kaptanLogar)("00023", "while adding filter to aggregate pipeline");
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
            (0, error_manager_1.kaptanLogar)("00023", `at least one group property name is required! (propertyName is undefined or not valid)`);
        }
        else {
            const groups = {};
            for (const name of propertyName) {
                if (typeof name === "string") {
                    groups[name] = `$${name}`;
                }
                else {
                    (0, error_manager_1.kaptanLogar)("00023", `property names must be a string, propertyName value is not valid!`);
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
            (0, error_manager_1.kaptanLogar)("00023", `each stage must be a valid stage object!`);
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
            (0, error_manager_1.kaptanLogar)("00023", `at least one property name is required! (propertyName is undefined or not valid)`);
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
                    (0, error_manager_1.kaptanLogar)("00023", `property names must be a string, propertyName value is not valid!`);
                }
            }
            this._pipeline.push(sort);
            return this;
        }
    }
    _addCalculation_(propertyName, projectedName, type) {
        if (!propertyName || typeof propertyName !== "string" || typeof projectedName !== "string") {
            (0, error_manager_1.kaptanLogar)("00023", `invalid value for propertyName projectedName or it's either undefined or not a string!`);
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
            const { readConcern, suppressAuth, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...(0, validator_1.copyOwnPropsOnly)(options) };
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
                    (0, error_manager_1.kaptanLogar)("00023", `couldn't get the next page of the items!`);
                }
            };
            return {
                items: convertIds ? (0, internal_id_converter_1.recursivelyConvertIds)(items) : items,
                length,
                hasNext,
                next,
                pipeline
            };
        }
        catch (err) {
            (0, error_manager_1.kaptanLogar)("00023", `when running the aggregation pipeline! Pipeline: ${this._pipeline}, Details: ${err}`);
        }
    }
    constructor(collectionId) {
        if (!collectionId || typeof collectionId !== "string") {
            (0, error_manager_1.kaptanLogar)("00007");
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
