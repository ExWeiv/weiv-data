"use strict";
const data_aggregate_1 = require("./Aggregate/data_aggregate");
const data_filter_1 = require("./Filter/data_filter");
const data_query_1 = require("./Query/data_query");
const queryReferenced_1 = require("./Functions/QueryReferenced/queryReferenced");
const bulkInsert_1 = require("./Functions/bulkInsert");
const bulkRemove_1 = require("./Functions/bulkRemove");
const bulkSave_1 = require("./Functions/bulkSave");
const bulkUpdate_1 = require("./Functions/bulkUpdate");
const get_1 = require("./Functions/get");
const insert_1 = require("./Functions/insert");
const insertReference_1 = require("./Functions/insertReference");
const isReferenced_1 = require("./Functions/isReferenced");
const remove_1 = require("./Functions/remove");
const removeReference_1 = require("./Functions/removeReference");
const replaceReferences_1 = require("./Functions/replaceReferences");
const save_1 = require("./Functions/save");
const truncate_1 = require("./Functions/truncate");
const update_1 = require("./Functions/update");
const idConverter_1 = require("./Functions/idConverter");
const flushCache_1 = require("./Functions/flushCache");
const native_1 = require("./Functions/native");
const replace_1 = require("./Functions/replace");
const findOne_1 = require("./Functions/Helpers/findOne");
const getAndRemove_1 = require("./Functions/Helpers/getAndRemove");
const getAndReplace_1 = require("./Functions/Helpers/getAndReplace");
const getAndUpdate_1 = require("./Functions/Helpers/getAndUpdate");
const multiply_1 = require("./Functions/multiply");
const increment_1 = require("./Functions/increment");
const push_1 = require("./Functions/push");
const pull_1 = require("./Functions/pull");
module.exports = {
    aggregate: (collectionId) => new data_aggregate_1.WeivDataAggregate(collectionId),
    filter: () => new data_filter_1.WeivDataFilter(),
    query: (collectionId) => new data_query_1.WeivDataQuery(collectionId),
    queryReferenced: queryReferenced_1.queryReferenced,
    bulkInsert: bulkInsert_1.bulkInsert,
    bulkRemove: bulkRemove_1.bulkRemove,
    bulkSave: bulkSave_1.bulkSave,
    bulkUpdate: bulkUpdate_1.bulkUpdate,
    get: get_1.get,
    insert: insert_1.insert,
    insertReference: insertReference_1.insertReference,
    isReferenced: isReferenced_1.isReferenced,
    remove: remove_1.remove,
    removeReference: removeReference_1.removeReference,
    replaceReferences: replaceReferences_1.replaceReferences,
    save: save_1.save,
    truncate: truncate_1.truncate,
    update: update_1.update,
    idConverter: idConverter_1.idConverter,
    flushCache: flushCache_1.flushCache,
    native: native_1.native,
    replace: replace_1.replace,
    findOne: findOne_1.findOne,
    getAndRemove: getAndRemove_1.getAndRemove,
    getAndReplace: getAndReplace_1.getAndReplace,
    getAndUpdate: getAndUpdate_1.getAndUpdate,
    multiply: multiply_1.multiply,
    increment: increment_1.increment,
    push: push_1.push,
    pull: pull_1.pull
};
