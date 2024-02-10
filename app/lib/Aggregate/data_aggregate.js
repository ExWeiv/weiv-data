"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeivDataAggregate = void 0;
const pipeline_helpers_1 = require("../Helpers/pipeline_helpers");
const data_aggregate_result_1 = require("./data_aggregate_result");
class WeivDataAggregate extends data_aggregate_result_1.InternalWeivDataAggregateResult {
    constructor(collectionId) {
        if (!collectionId) {
            throw Error(`WeivData - Database and Collection name required`);
        }
        super(collectionId);
    }
    ascending(propertyName) {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        this.sorting = {
            propertyName,
            type: 1,
        };
        return this;
    }
    avg(propertyName, projectedName = `${propertyName}Avg`) {
        if (!propertyName) {
            throw Error(`WeivData - Property name is required!`);
        }
        this.addGroup({
            _id: "0",
            [projectedName]: {
                $avg: `$${propertyName}`,
            },
        });
        return this;
    }
    count() {
        this.countCalled = true;
        return this;
    }
    descending(propertyName) {
        if (!propertyName) {
            throw Error(`WeivData - Property name is required!`);
        }
        this.sorting = {
            propertyName,
            type: -1,
        };
        return this;
    }
    filter(filter) {
        if (!filter) {
            throw Error(`WeivData - Filter is empty, please add a filter using weivData.filter method!`);
        }
        this.pipeline = (0, pipeline_helpers_1.checkPipelineArray)(this.pipeline);
        this.pipeline.push({
            $match: {
                ...filter.filters,
            },
        });
        return this;
    }
    group(...propertyName) {
        if (!propertyName) {
            throw Error(`WeivData - Property or properties are required!`);
        }
        if (this.groupCreated === true) {
            throw Error(`WeivData - Group is already set!`);
        }
        let propertyNames = {};
        if (typeof propertyName === "string") {
            propertyNames[propertyName] = `$${propertyName}`;
        }
        else if (Array.isArray(propertyName)) {
            for (const name of propertyName) {
                propertyNames[name] = `$${name}`;
            }
        }
        this.addGroup({
            ...propertyNames,
        }, true);
        this.groupCreated = true;
        return this;
    }
    having(filter) {
        if (!filter) {
            throw Error(`WeivData - Filter is empty, please add a filter using weivData.filter method!`);
        }
        this.havingFilter = {
            $match: {
                ...filter.filters,
            },
        };
        return this;
    }
    limit(limit) {
        if (!limit && limit != 0) {
            throw Error(`WeivData - Limit number is required please specify a limit amount`);
        }
        if (limit != 0) {
            this.limitNumber = limit;
        }
        return this;
    }
    max(propertyName, projectedName = `${propertyName}Max`) {
        if (!propertyName) {
            throw Error(`WeivData - Property name is required!`);
        }
        this.addGroup({
            _id: "0",
            [projectedName]: {
                $max: `$${propertyName}`,
            },
        });
        return this;
    }
    min(propertyName, projectedName = `${propertyName}Min`) {
        if (!propertyName) {
            throw Error(`WeivData - Property name is required!`);
        }
        this.addGroup({
            _id: "0",
            [projectedName]: {
                $min: `$${propertyName}`,
            },
        });
        return this;
    }
    async run(options) {
        const { suppressAuth, consistentRead, cleanupAfter } = options || {};
        const { collection, cleanup } = await this.connectionHandler(suppressAuth);
        if (this.sorting) {
            this.pipeline = (0, pipeline_helpers_1.checkPipelineArray)(this.pipeline);
            this.pipeline.push({
                $sort: {
                    [this.sorting.propertyName]: this.sorting.type
                }
            });
        }
        this.pipeline = (0, pipeline_helpers_1.sortAggregationPipeline)(this.pipeline);
        if (this.currentGroup && this.sorting) {
            if (this.currentGroup["$group"]) {
                if (this.currentGroup["$group"]._exweivDocument) {
                    this.pipeline.push({
                        $sort: {
                            [`_exweivDocument.${this.sorting.propertyName}`]: this.sorting.type,
                        },
                    });
                }
            }
        }
        if (this.countCalled === true) {
            const keys = Object.keys(this.pipeline);
            for (const key of keys) {
                const data = this.pipeline[key];
                if (data["$group"]) {
                    data["$group"].count = {
                        $sum: 1,
                    };
                }
            }
        }
        if (this.havingFilter && this.currentGroup) {
            this.pipeline.push(this.havingFilter);
        }
        const aggregation = collection.aggregate(this.pipeline);
        if (this.skipNumber) {
            aggregation.skip(this.skipNumber);
        }
        if (this.limitNumber) {
            aggregation.limit(this.limitNumber);
        }
        if (consistentRead === true) {
            aggregation.readConcern("majority");
        }
        const aggregateResult = await this.getResult(suppressAuth);
        let modifiedItems = aggregateResult.items.map((document) => {
            if (document._exweivDocument) {
                const _exweivDocumentExtracted = document._exweivDocument;
                delete _exweivDocumentExtracted._id;
                delete document._exweivDocument;
                return {
                    ...document,
                    ..._exweivDocumentExtracted,
                };
            }
            else {
                return document;
            }
        });
        if (cleanupAfter === true) {
            await cleanup();
        }
        return {
            ...aggregateResult,
            items: modifiedItems,
        };
    }
    skip(skip) {
        if (!skip && skip != 0) {
            throw Error(`WeivData - Skip number is required please specify a skip number`);
        }
        this.skipNumber = skip;
        return this;
    }
    sum(propertyName, projectedName = `${propertyName}Sum`) {
        if (!propertyName) {
            throw Error(`WeivData - Property name is required!`);
        }
        this.addGroup({
            _id: "0",
            [projectedName]: {
                $sum: `$${propertyName}`,
            },
        });
        return this;
    }
    setCurrentGroup() {
        this.pipeline = (0, pipeline_helpers_1.checkPipelineArray)(this.pipeline);
        this.currentGroup = this.pipeline.find(stage => stage["$group"]);
        if (this.currentGroup) {
            return this.currentGroup;
        }
        else {
            this.currentGroup = {};
            return undefined;
        }
    }
    addGroup(groupObject, isGroup) {
        const currentGroup = this.setCurrentGroup();
        this.pipeline = this.pipeline.filter((stage) => !stage["$group"]);
        if (!currentGroup) {
            if (isGroup != true) {
                this.currentGroup = {
                    ...groupObject,
                    ...this.currentGroup,
                };
            }
            else {
                this.currentGroup = {
                    ...this.currentGroup,
                    _id: groupObject,
                    _exweivDocument: { $first: "$$ROOT" },
                };
            }
            this.pipeline.push({ $group: this.currentGroup });
        }
        else {
            if (isGroup != true) {
                this.currentGroup["$group"] = {
                    ...groupObject,
                    ...this.currentGroup["$group"],
                };
            }
            else {
                this.currentGroup["$group"] = {
                    ...this.currentGroup["$group"],
                    _id: groupObject,
                    _exweivDocument: { $first: "$$ROOT" },
                };
            }
            this.pipeline.push({ $group: this.currentGroup["$group"] });
        }
    }
}
exports.WeivDataAggregate = WeivDataAggregate;
