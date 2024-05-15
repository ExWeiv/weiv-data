import { sortBy, filter, defaultTo } from 'lodash';
import type { Document } from 'mongodb/mongodb';

/** @internal */
export type PipelineArray = Document[];

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

export function checkPipelineArray(pipeline: PipelineArray): PipelineArray {
    return defaultTo(pipeline, []);
}

export function sortAggregationPipeline(pipeline: PipelineArray): PipelineArray {
    if (Array.isArray(pipeline) === true) {
        if (pipeline) {
            //@ts-ignore
            pipeline = sortBy(pipeline, (stage) => customPipelineSortOrder[Object.keys(stage)[0]]);
            const totalGroup = filter(pipeline, (stage) => stage["$group"]).length;

            if (totalGroup > 1) {
                throw new Error("you can't use more than one group.");
            }

            return pipeline;
        } else {
            return [];
        }
    } else {
        throw new Error(`WeivData - Error: Incoming aggregate pipeline is not an array!`);
    }
}