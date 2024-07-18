"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPipeline = getPipeline;
const name_helpers_1 = require("./name_helpers");
const error_manager_1 = require("../Errors/error_manager");
function getPipeline(itemId, targetCollectionId, propertyName, pipelineOptions) {
    if (typeof itemId !== "object" || typeof targetCollectionId !== "string" || typeof propertyName !== "string" || typeof pipelineOptions !== "object") {
        (0, error_manager_1.kaptanLogar)("00012", "parameter type/s are invalid");
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
