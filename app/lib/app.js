"use strict";
const data_aggregate_1 = require("./DataAggregate/data_aggregate");
const data_filter_1 = require("./DataFilter/data_filter");
const connection_provider_1 = require("./Connection/connection_provider");
const data_query_1 = require("./DataQuery/data_query");
const insert_1 = require("./Functions/insert");
const update_1 = require("./Functions/update");
const get_1 = require("./Functions/get");
const save_1 = require("./Functions/save");
const remove_1 = require("./Functions/remove");
const truncate_1 = require("./Functions/truncate");
const insertReference_1 = require("./Functions/insertReference");
const replaceReferences_1 = require("./Functions/replaceReferences");
const isReferenced_1 = require("./Functions/isReferenced");
const removeReference_1 = require("./Functions/removeReference");
const bulkInsert_1 = require("./Functions/bulkInsert");
const bulkRemove_1 = require("./Functions/bulkRemove");
const bulkSave_1 = require("./Functions/bulkSave");
const bulkUpdate_1 = require("./Functions/bulkUpdate");
const queryReferenced_1 = require("./Functions/QueryReferenced/queryReferenced");
const weivData = {
    aggregate: data_aggregate_1.ExWeivDataAggregate,
    filter: data_filter_1.ExWeivDataFilter,
    cleanup: connection_provider_1.cleanupClientConnections,
    query: data_query_1.ExWeivDataQuery,
    insert: insert_1.insert,
    update: update_1.update,
    get: get_1.get,
    save: save_1.save,
    remove: remove_1.remove,
    truncate: truncate_1.truncate,
    insertReference: insertReference_1.insertReference,
    replaceReferences: replaceReferences_1.replaceReferences,
    isReferenced: isReferenced_1.isReferenced,
    removeReference: removeReference_1.removeReference,
    bulkInsert: bulkInsert_1.bulkInsert,
    bulkRemove: bulkRemove_1.bulkRemove,
    bulkSave: bulkSave_1.bulkSave,
    bulkUpdate: bulkUpdate_1.bulkUpdate,
    queryReferenced: queryReferenced_1.queryReferenced
};
module.exports = weivData;
