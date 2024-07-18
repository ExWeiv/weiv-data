import type { ObjectId } from 'mongodb/mongodb';
import { splitCollectionId } from './name_helpers';
import { kaptanLogar } from '../Errors/error_manager';

export function getPipeline(itemId: ObjectId, targetCollectionId: string, propertyName: string, pipelineOptions: { pageSize: number, skip: number, order: 'asc' | 'desc' }) {
    if (typeof itemId !== "object" || typeof targetCollectionId !== "string" || typeof propertyName !== "string" || typeof pipelineOptions !== "object") {
        kaptanLogar("00012", "parameter type/s are invalid");
    }

    const { collectionName } = splitCollectionId(targetCollectionId);
    return [
        {
            $match: {
                _id: itemId,
            },
        },
        {
            $sort: {
                [propertyName]: pipelineOptions.order === 'asc' ? 1 : -1
            }
        },
        {
            $lookup: {
                from: collectionName,
                localField: propertyName,
                foreignField: "_id",
                as: "referencedItems",
            },
        },
        {
            $project: {
                referencedItems: 1,
                totalItems: { $size: `$${propertyName}` },
            },
        },
        {
            $addFields: {
                referencedItemIds: {
                    $slice: ["$referencedItems._id", pipelineOptions.skip, pipelineOptions.pageSize],
                },
            },
        },
        {
            $addFields: {
                referencedItems: {
                    $filter: {
                        input: "$referencedItems",
                        as: "item",
                        cond: {
                            $in: [
                                "$$item._id",
                                "$referencedItemIds",
                            ],
                        },
                    },
                },
            },
        },
        {
            $project: {
                referencedItems: 1,
                totalItems: 1,
            },
        },
    ]
}