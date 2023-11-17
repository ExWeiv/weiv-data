"use strict";
const data_aggregate_1 = require("./DataAggregate/data_aggregate");
const data_filter_1 = require("./DataFilter/data_filter");
const connection_provider_1 = require("./Connection/connection_provider");
const data_query_1 = require("./DataQuery/data_query");
const weivData = {
    aggregate: data_aggregate_1.ExWeivDataAggregate,
    filter: data_filter_1.ExWeivDataFilter,
    cleanup: connection_provider_1.cleanupClientConnections,
    query: data_query_1.ExWeivDataQuery
};
module.exports = weivData;
