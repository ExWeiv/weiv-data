import { Document } from "mongodb/mongodb";
import { checkPipelineArray, sortAggregationPipeline, } from "../Helpers/pipeline_helpers";
import { WeivDataFilter } from "../Filter/data_filter";
import { InternalWeivDataAggregateResult, WeivDataAggregateResult } from './data_aggregate_result';
import type { CleanupAfter, ConsistentRead, SuppressAuth } from "../Helpers/collection";

/**
 * Options to use when running an aggregation.
 * 
 * @public
 */
export interface AggregateRunOptions {
    /**
     * Bypass permissions of user when using aggregate. When set to true AdminURI will be used automatically.
     */
    suppressAuth?: SuppressAuth,

    /**
     * Enable consistent read from clusters. This will change the readConvern to "majority", in this way you'll get the most up to date data.
     */
    consistentRead?: ConsistentRead,

    /**
     * When set to true .close function of MongoClient will be called after the operation. (Next call will take longer to complete)
     */
    cleanupAfter?: CleanupAfter
}

/** @internal */
export type PipelineGroupObject<T> = {
    _id?: T;
    [key: string]: any;
    $group?: object;
};

/**
 * Welcome to `weivData.aggregate` function of weiv-data library. This feature/function allows you to perform calculations on your database collections data.
 * You can use aggregate with any collection! Read documentation to learn from examples.
 * 
 * Features we are working on for this function:
 * 
 * * **AI** (Calculate estimated results for a specific property such as estimated preparation time for a meal from an orders collection)
 * * **Language Filters** (Filter aggregations based on a language) 
 * * *More!*
 * 
 * @public
 */
export class WeivDataAggregate extends InternalWeivDataAggregateResult {
    private limitNumber!: number;
    private skipNumber!: number;
    private currentGroup!: PipelineGroupObject<string | object>;
    private sorting!: { propertyName: string; type: 1 | -1; };
    private groupCreated!: boolean;
    private countCalled!: boolean;
    private havingFilter!: { $match: object; };

    /** @internal */
    constructor(collectionId: string) {
        if (!collectionId) {
            throw Error(`WeivData - Database and Collection name required`);
        }

        super(collectionId);
    }

    /**
     * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in ascending order.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .ascending("modelType")
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param propertyName The properties used in the sort.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation.
     */
    ascending(propertyName: string): WeivDataAggregate {
        if (!propertyName) {
            throw Error(`WeivData - Property name required!`);
        }
        this.sorting = {
            propertyName,
            type: 1,
        };
        return this;
    }

    /**
     * Refines a `WeivDataAggregate` to only contain the average value from each aggregation group.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .avg("trainedDataSize")
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param propertyName The property in which to find the average valu
     * @param projectedName The name of the property in the aggregation results containing the average value.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation.
     */
    avg(propertyName: string, projectedName = `${propertyName}Avg`): WeivDataAggregate {
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

    /**
     * Refines a `WeivDataAggregate` to contain the item count of each group in the aggregation.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .group("modelType", "trainedDataSize")
     *  .count()
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation.
     */
    count(): WeivDataAggregate {
        this.countCalled = true;
        return this;
    }

    /**
     * Adds a sort to an aggregation, sorting by the items or groups by the specified properties in descending order.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .descending("modelType")
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param propertyName The properties used in the sort.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation.
     */
    descending(propertyName: string): WeivDataAggregate {
        if (!propertyName) {
            throw Error(`WeivData - Property name is required!`);
        }
        this.sorting = {
            propertyName,
            type: -1,
        };
        return this;
    }

    /**
     * Filters out items from being used in an aggregation.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * let filter = weivData.filter().eq("modelType", "S1");
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .filter(filter)
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param filter The filter to use to filter out items from being used in the aggregation.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation.
     */
    filter(filter: WeivDataFilter): WeivDataAggregate {
        if (!filter) {
            throw Error(`WeivData - Filter is empty, please add a filter using weivData.filter method!`);
        }
        this.pipeline = checkPipelineArray(this.pipeline);
        this.pipeline.push({
            $match: {
                ...filter.filters,
            },
        });
        return this;
    }

    /**
     * Groups items together in an aggregation.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .group("t2Members", "t1Members")
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param propertyName The property or properties to group on.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation.
     */
    group(...propertyName: string[]): WeivDataAggregate {
        if (!propertyName) {
            throw Error(`WeivData - Property or properties are required!`);
        }
        if (this.groupCreated === true) {
            throw Error(`WeivData - Group is already set!`);
        }

        let propertyNames: { [key: string]: string } = {};
        if (typeof propertyName === "string") {
            propertyNames[propertyName] = `$${propertyName}`;
        } else if (Array.isArray(propertyName)) {
            for (const name of propertyName) {
                propertyNames[name] = `$${name}`;
            }
        }

        this.addGroup(
            {
                ...propertyNames,
            },
            true
        );

        this.groupCreated = true;
        return this;
    }

    /**
     * Filters out groups from being returned from an aggregation.
     * 
     * > Note: possible bug! This function may not work as you expect!
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * let having = weivData.filter().gt("trainedDataSize", 100000000)
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .having(having)
     *  .max("trainedDataSize", "maxTrainedDataSize")
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param filter The filter to use to filter out groups from being returned from the aggregation.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation.
     */
    having(filter: WeivDataFilter): WeivDataAggregate {
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

    /**
     * Limits the number of items or groups the aggregation returns.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * let having = weivData.filter().gt("trainedDataSize", 100000000)
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .having(having)
     *  .max("trainedDataSize", "maxTrainedDataSize")
     *  .limit(150)
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param limit The number of items or groups to return.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation.
     */
    limit(limit: number): WeivDataAggregate {
        if (!limit && limit != 0) {
            throw Error(`WeivData - Limit number is required please specify a limit amount`);
        }

        if (limit != 0) {
            this.limitNumber = limit;
        }

        return this;
    }

    /**
    * Refines a `WeivDataAggregate` to only contain the maximum value from each aggregation group.
    * 
    * @example
    * ```js
    * import weivData from '@exweiv/weiv-data';
    * 
    * let having = weivData.filter().gt("trainedDataSize", 100000000)
    * 
    * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
    *  .having(having)
    *  .max("trainedDataSize", "maxTrainedDataSize")
    *  .run(options)
    * 
    * console.log(aggregateResult);
    * ```
    * 
    * @param propertyName The property in which to find the maximum value.
    * @param projectedName The name of the property in the aggregation results containing the maximum value.
    * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation. 
    */
    max(propertyName: string, projectedName = `${propertyName}Max`): WeivDataAggregate {
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

    /**
    * Refines a `WeivDataAggregate` to only contain the minimum value from each aggregation group.
    * 
    * @example
    * ```js
    * import weivData from '@exweiv/weiv-data';
    * 
    * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
    *  .min("trainedDataSize", "minTrainedDataSize")
    *  .run(options)
    * 
    * console.log(aggregateResult);
    * ```
    * 
    * @param propertyName The property in which to find the minimum value.
    * @param projectedName The name of the property in the aggregation results containing the minimum value.
    * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation. 
    */
    min(propertyName: string, projectedName = `${propertyName}Min`): WeivDataAggregate {
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

    /**
    * Runs the aggregation and returns the results.
    * 
    * @example
    * ```js
    * import weivData from '@exweiv/weiv-data';
    * 
    * const filter = weivData.filter().gt("trainedDataSize", 100000000);
    * 
    * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
    *  .group("modelType", "trainedDataSize", "t1Members")
    *  .filter(filter)
    *  .descending("trainedDataSize")
    *  .skip(5)
    *  .limit(118)
    *  .run({suppressAuth: true})
    * 
    * console.log(aggregateResult);
    * ```
    * 
    * @param options Options to use when running an aggregation.
    * @returns {WeivDataAggregateResult} Fulfilled - A Promise that resolves to the results of the aggregation. Rejected - Error that caused the aggregation to fail.
    */
    async run(options?: AggregateRunOptions): Promise<WeivDataAggregateResult> {
        // Get the options passed with run() and then connect to client and get memberId (if there is a memberId) and also pass suppressAuth option
        const { suppressAuth, consistentRead, cleanupAfter } = options || {};
        const { collection, cleanup } = await this.connectionHandler(suppressAuth);

        if (this.sorting) {
            this.pipeline = checkPipelineArray(this.pipeline);
            this.pipeline.push({
                $sort: {
                    [this.sorting.propertyName]: this.sorting.type
                }
            })
        }

        // Sort pipeline based on priority order of pipeline.
        this.pipeline = sortAggregationPipeline(this.pipeline);

        // Fix the sorting if aggregation includes a group and sorting
        if (this.currentGroup && this.sorting) {
            if (this.currentGroup["$group"]) { //@ts-ignore
                if (this.currentGroup["$group"]._exweivDocument) {
                    this.pipeline.push({
                        $sort: {
                            [`_exweivDocument.${this.sorting.propertyName}`]:
                                this.sorting.type,
                        },
                    });
                }
            }
        }

        // Enable total count calculator if count() is added to aggregation
        if (this.countCalled === true) {
            const keys = Object.keys(this.pipeline);
            for (const key of keys) { //@ts-ignore
                const data = this.pipeline[key];
                if (data["$group"]) {
                    data["$group"].count = {
                        $sum: 1,
                    };
                }
            }
        }

        // Add having filters to end of the pipeline to filter grouped results only
        if (this.havingFilter && this.currentGroup) {
            this.pipeline.push(this.havingFilter);
        }

        // Create the aggregation on the current collection
        const aggregation = collection.aggregate(this.pipeline);

        // Add skip if there is a skip set
        if (this.skipNumber) {
            aggregation.skip(this.skipNumber);
        }

        // Add limit if there is a limit set
        if (this.limitNumber) {
            aggregation.limit(this.limitNumber);
        }

        // Enable read consistency if consistentRead enabled via run options
        if (consistentRead === true) {
            (aggregation as any).readConcern("majority");
        }

        // Make the call to the MongoDB and convert it to an array via result function
        const aggregateResult = await this.getResult(suppressAuth);

        // Modify result of call
        let modifiedItems = aggregateResult.items.map((document: Document) => {
            // Check if there is a field called _exweivDocument if so extract the fields in it (except _id) and add it to main array if there is not a field called _exweivDocument return the item
            if (document._exweivDocument) {
                const _exweivDocumentExtracted = document._exweivDocument;
                delete _exweivDocumentExtracted._id;
                delete document._exweivDocument;
                return {
                    ...document,
                    ..._exweivDocumentExtracted,
                };
            } else {
                return document;
            }
        });

        // Close the connection to space up the connection pool in MongoDB (if cleanupAfter === true)
        if (cleanupAfter === true) {
            await cleanup();
        }

        // Return the WeivDataAggregateResult
        return {
            ...aggregateResult,
            items: modifiedItems,
        };
    }

    /**
     * Sets the number of items or groups to skip before returning aggregation results.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .max("trainedDataSize", "maxTrainedDataSize")
     *  .skip(18)
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param skip The number of items or groups to skip in the aggregation results before returning the results.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation. 
     */
    skip(skip: number): WeivDataAggregate {
        if (!skip && skip != 0) {
            throw Error(`WeivData - Skip number is required please specify a skip number`);
        }

        this.skipNumber = skip;
        return this;
    }

    /**
     * Refines a `WeivDataAggregate` to contain the sum from each aggregation group.
     * 
     * @example
     * ```js
     * import weivData from '@exweiv/weiv-data';
     * 
     * const aggregateResult = await weivData.aggregate("Clusters/AiModels")
     *  .sum("trainedDataSize")
     *  .run(options)
     * 
     * console.log(aggregateResult);
     * ```
     * 
     * @param propertyName The property in which to find the sum.
     * @param projectedName The name of the property in the aggregation results containing the sum.
     * @returns {WeivDataAggregate} A `WeivDataAggregate` object representing the refined aggregation. 
     */
    sum(propertyName: string, projectedName = `${propertyName}Sum`): WeivDataAggregate {
        if (!propertyName) {
            throw Error(`WeivData - Property name is required!`)
        }

        this.addGroup({
            _id: "0",
            [projectedName]: {
                $sum: `$${propertyName}`,
            },
        });
        return this;
    }

    /**@internal */
    private setCurrentGroup() {
        this.pipeline = checkPipelineArray(this.pipeline);  //@ts-ignore
        this.currentGroup = this.pipeline.find(stage => stage["$group"]);
        if (this.currentGroup) {
            return this.currentGroup;
        } else {
            this.currentGroup = {};
            return undefined;
        }
    }

    /**@internal */
    private addGroup(groupObject: PipelineGroupObject<string | object>, isGroup?: boolean) {
        const currentGroup = this.setCurrentGroup(); //@ts-ignore
        this.pipeline = this.pipeline.filter((stage) => !stage["$group"]);

        if (!currentGroup) {
            if (isGroup != true) {
                this.currentGroup = {
                    ...groupObject,
                    ...this.currentGroup,
                };
            } else {
                this.currentGroup = {
                    ...this.currentGroup,
                    _id: groupObject,
                    _exweivDocument: { $first: "$$ROOT" },
                };
            }

            this.pipeline.push({ $group: this.currentGroup });
        } else {
            if (isGroup != true) {
                this.currentGroup["$group"] = {
                    ...groupObject,
                    ...this.currentGroup["$group"],
                };
            } else {
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