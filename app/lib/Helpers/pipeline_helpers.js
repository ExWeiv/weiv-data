"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortAggregationPipeline = exports.checkPipelineArray = void 0;
const lodash_1 = require("lodash");
const customPipelineSortOrder = {
    _owner: 1,
    $match: 2,
    $distinct: 3,
    $sort: 4,
    $group: 5,
    $project: 6,
    $lookup: 6.1,
    $unwind: 6.2,
    $skip: 7,
    $limit: 8,
    $out: 9,
    $merge: 10,
};
function checkPipelineArray(pipeline) {
    return (0, lodash_1.defaultTo)(pipeline, []);
}
exports.checkPipelineArray = checkPipelineArray;
function sortAggregationPipeline(pipeline) {
    if (Array.isArray(pipeline) === true) {
        if (pipeline) {
            pipeline = (0, lodash_1.sortBy)(pipeline, (stage) => customPipelineSortOrder[Object.keys(stage)[0]]);
            const totalGroup = (0, lodash_1.filter)(pipeline, (stage) => stage["$group"]).length;
            if (totalGroup > 1) {
                throw new Error("You can't use more than one group.");
            }
            return pipeline;
        }
        else {
            return [];
        }
    }
    else {
        throw new Error(`WeivData - Error: Incoming aggregate pipeline is not an array!`);
    }
}
exports.sortAggregationPipeline = sortAggregationPipeline;
