"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPipeline = void 0;
const name_helpers_1 = require("./name_helpers");
function getPipeline(itemId, targetCollectionId, propertyName, pipelineOptions) {
    if (typeof itemId !== "object" || typeof targetCollectionId !== "string" || typeof propertyName !== "string" || typeof pipelineOptions !== "object") {
        throw new Error("One or multiple parameter type is wrong!");
    }
    const { collectionName } = (0, name_helpers_1.splitCollectionId)(targetCollectionId);
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
    ];
}
exports.getPipeline = getPipeline;
