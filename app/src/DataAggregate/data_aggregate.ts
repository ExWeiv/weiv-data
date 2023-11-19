import { Db, Document } from "mongodb/mongodb";
import { checkPipelineArray, sortAggregationPipeline, } from "../Helpers/pipeline_helpers";
import { reportError } from '../Log/log_handlers';
import { DataFilter } from "../DataFilter/data_filter";
import { DataAggregateInterface } from "../Interfaces/interfaces";
import { WeivDataAggregateResult } from "./aggregate_result";
import { useClient } from '../Connection/connection_provider';
import { splitCollectionId } from '../Helpers/name_helpers';

export class DataAggregate implements DataAggregateInterface {
    private collectionName: string;
    private dbName = "exweiv";
    private db!: Db;
    private pipeline!: PipelineArray;
    private limitNumber!: number;
    private skipNumber!: number;
    private currentGroup!: PipelineGroupObject<string | object>;
    private sorting!: SortingObject;
    private groupCreated!: boolean;
    private countCalled!: boolean;
    private havingFilter!: HavingFilter;

    constructor(collectionId: string) {
        if (!collectionId) {
            reportError("Database and Collection name required");
        }

        const { dbName, collectionName } = splitCollectionId(collectionId);

        this.collectionName = collectionName;
        this.dbName = dbName;
    }

    /**
     * @description Adds a sort to an aggregation, sorting by the items or groups by the specified properties in ascending order.
     * @param propertyName The property used in the sort.
     * @returns A `WeivDataAggregate` object representing the refined aggregation
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .ascending("population")
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    ascending(propertyName: string): DataAggregate {
        if (!propertyName) {
            reportError("Property name required!");
        }
        this.sorting = {
            propertyName,
            type: 1,
        };
        return this;
    }

    /**
     * @description Refines a `WeivDataAggregate` to only contain the average value from each aggregation group.
     * @param propertyName The property in which to find the average value.
     * @param projectedName The name of the property in the aggregation results containing the average value.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .avg("population", "averagePopulation")
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    avg(
        propertyName: string,
        projectedName = `${propertyName}Avg`
    ): DataAggregate {
        if (!propertyName) {
            reportError("Property name is required!");
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
     * @description Refines a WixDataAggregate to contain the item count of each group in the aggregation.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .group(["population", "year"])
     * .count()
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    count(): DataAggregate {
        this.countCalled = true;
        return this;
    }

    /**
     * @description Adds a sort to an aggregation, sorting by the items or groups by the specified properties in descending order.
     * @param propertyName The property used in the sort.
     * @returns A WeivDataAggregate object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .descending("population")
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    descending(propertyName: string): DataAggregate {
        if (!propertyName) {
            reportError("Property name is required!");
        }
        this.sorting = {
            propertyName,
            type: -1,
        };
        return this;
    }

    /**
     * @description Filters out items from being used in an aggregation.
     * @param filter The filter to use to filter out items from being used in the aggregation.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .descending("population")
     * .filter(weivData.filter().gt("population", 1000000))
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    filter(filter: DataFilter): DataAggregate {
        if (!filter) {
            reportError("Filter is empty, please add a filter using weivData.filter method!");
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
     * @description Groups items together in an aggregation.
     * @param propertyName The property or properties to group on.
     * @returns A WeivDataAggregate object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .group(["population", "year"]) //or a single string without an array or with an array
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    group(propertyName: string | string[]): DataAggregate {
        if (!propertyName) {
            reportError("Property or properties are required!");
        }
        if (this.groupCreated === true) {
            reportError("Group is already set!");
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
     * @description Filters out groups from being returned from an aggregation.
     * @param filter The filter to use to filter out groups from being returned from the aggregation.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .group(["population", "year"])
     * .having(weivData.filter().gt("population", 1000000))
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    having(filter: DataFilter): DataAggregate {
        if (!filter) {
            reportError("Filter is empty, please add a filter using weivData.filter method!");
        }
        this.havingFilter = {
            $match: {
                ...filter.filters,
            },
        };
        return this;
    }

    /**
     * @description Limits the number of items or groups the aggregation returns.
     * @param limit The number of items or groups to return.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .limit(100)
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    limit(limit: number): DataAggregate {
        if (!limit) {
            reportError("Limit number is required please specify a limit amount");
        }
        this.limitNumber = limit;
        return this;
    }

    /**
     * @description Refines a `WeivDataAggregate` to only contain the maximum value from each aggregation group.
     * @param propertyName The property in which to find the maximum value.
     * @param projectedName The name of the property in the aggregation results containing the maximum value.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .group(["population", "year"])
     * .max("population", "maximumPopulation")
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    max(
        propertyName: string,
        projectedName = `${propertyName}Max`
    ): DataAggregate {
        if (!propertyName) {
            reportError("Property name is required!");
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
     * @description Refines a `WeivDataAggregate` to only contain the minimum value from each aggregation group.
     * @param propertyName The property in which to find the minimum value.
     * @param projectedName The name of the property in the aggregation results containing the minimum value.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .group(["population", "year"])
     * .min("population", "minimumPopulation")
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    min(
        propertyName: string,
        projectedName = `${propertyName}Min`
    ): DataAggregate {
        if (!propertyName) {
            reportError("Property name is required!");
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
     * @description Runs the aggregation and returns the results.
     * @param options Options to use when running an aggregation.
     * @returns Fulfilled - A Promise that resolves to the results of the aggregation. Rejected - Error that caused the aggregation to fail.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * let options = {
     *  suppressAuth: true,
     *  consistentRead: true
     * }
     *
     * weivData.aggregate("PopulationData")
     * .group(["population", "year"])
     * .min("population", "minimumPopulation")
     * .run(options)
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    async run(
        options: AggregateRunOptions = {
            suppressAuth: false,
            consistentRead: false,
            cleanAfterRun: false
        }
    ): Promise<AggregateResult> {
        // Get the options passed with run() and then connect to client and get memberId (if there is a memberId) and also pass suppressAuth option
        const { suppressAuth, consistentRead, cleanAfterRun } = options;
        const { collection, memberId, cleanup } = await this.connectionHandler(suppressAuth);

        // Check if suppressAuth false and if there is a memberId
        if (memberId && suppressAuth != true) {
            // Add a _owner field filter to query to only get member's items (do this before sorting the pipeline)
            this.pipeline.push({
                _owner: memberId,
            });
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
        const aggregateResult = await WeivDataAggregateResult(this.limitNumber, this.pipeline, this.dbName, this.collectionName, suppressAuth).getResult();

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

        // Close the connection to space up the connection pool in MongoDB (if cleanAfterRun === true)
        if (cleanAfterRun === true) {
            await cleanup();
        }

        // Return the WeivDataAggregateResult
        return {
            ...aggregateResult,
            items: modifiedItems,
        };
    }

    /**
     * @description Sets the number of items or groups to skip before returning aggregation results.
     * @param skip The number of items or groups to skip in the aggregation results before returning the results.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .skip(5)
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    skip(skip: number): DataAggregate {
        if (!skip) {
            reportError("Skip number is required please specify a skip number");
        }

        this.skipNumber = skip;
        return this;
    }

    /**
     * @description Refines a `WeivDataAggregate` to contain the sum from each aggregation group.
     * @param propertyName The property in which to find the sum.
     * @param projectedName The name of the property in the aggregation results containing the sum.
     * @returns A `WeivDataAggregate` object representing the refined aggregation.
     * @example
     * ```js
     * import weivData from '@exweiv/weivdata';
     *
     * weivData.aggregate("PopulationData")
     * .sum("population", "sumPopulation")
     * .run()
     * .then((result) => {
     *   let items = result.items;
     *   console.log(items);
     * })
     * ```
     */
    sum(
        propertyName: string,
        projectedName = `${propertyName}Sum`
    ): DataAggregate {
        if (!propertyName) {
            reportError("Property name is required!")
        }

        this.addGroup({
            _id: "0",
            [projectedName]: {
                $sum: `$${propertyName}`,
            },
        });
        return this;
    }

    private async connectionHandler(suppressAuth = false): Promise<ConnectionResult> {
        const { pool, cleanup, memberId } = await useClient(suppressAuth);

        if (this.dbName) {
            this.db = pool.db(this.dbName);
        } else {
            this.db = pool.db("exweiv");
        }

        const collection = this.db.collection(this.collectionName);
        return { collection, cleanup, memberId };
    }

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

    private addGroup(
        groupObject: PipelineGroupObject<string | object>,
        isGroup?: boolean
    ) {
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

export function ExWeivDataAggregate(dynamicName: string) {
    return new DataAggregate(dynamicName);
}
