"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = exports.push = exports.increment = exports.multiply = exports.getAndUpdate = exports.getAndReplace = exports.getAndRemove = exports.findOne = exports.replace = exports.native = exports.flushCache = exports.idConverter = exports.update = exports.truncate = exports.save = exports.replaceReferences = exports.removeReference = exports.remove = exports.isReferenced = exports.insertReference = exports.insert = exports.get = exports.bulkUpdate = exports.bulkSave = exports.bulkRemove = exports.bulkInsert = exports.queryReferenced = exports.aggregate = exports.filter = exports.query = void 0;
const data_aggregate_1 = require("./Aggregate/data_aggregate");
const data_filter_1 = require("./Filter/data_filter");
const data_query_1 = require("./Query/data_query");
const queryReferenced_1 = require("./Functions/QueryReferenced/queryReferenced");
Object.defineProperty(exports, "queryReferenced", { enumerable: true, get: function () { return queryReferenced_1.queryReferenced; } });
const bulkInsert_1 = require("./Functions/bulkInsert");
Object.defineProperty(exports, "bulkInsert", { enumerable: true, get: function () { return bulkInsert_1.bulkInsert; } });
const bulkRemove_1 = require("./Functions/bulkRemove");
Object.defineProperty(exports, "bulkRemove", { enumerable: true, get: function () { return bulkRemove_1.bulkRemove; } });
const bulkSave_1 = require("./Functions/bulkSave");
Object.defineProperty(exports, "bulkSave", { enumerable: true, get: function () { return bulkSave_1.bulkSave; } });
const bulkUpdate_1 = require("./Functions/bulkUpdate");
Object.defineProperty(exports, "bulkUpdate", { enumerable: true, get: function () { return bulkUpdate_1.bulkUpdate; } });
const get_1 = require("./Functions/get");
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return get_1.get; } });
const insert_1 = require("./Functions/insert");
Object.defineProperty(exports, "insert", { enumerable: true, get: function () { return insert_1.insert; } });
const insertReference_1 = require("./Functions/insertReference");
Object.defineProperty(exports, "insertReference", { enumerable: true, get: function () { return insertReference_1.insertReference; } });
const isReferenced_1 = require("./Functions/isReferenced");
Object.defineProperty(exports, "isReferenced", { enumerable: true, get: function () { return isReferenced_1.isReferenced; } });
const remove_1 = require("./Functions/remove");
Object.defineProperty(exports, "remove", { enumerable: true, get: function () { return remove_1.remove; } });
const removeReference_1 = require("./Functions/removeReference");
Object.defineProperty(exports, "removeReference", { enumerable: true, get: function () { return removeReference_1.removeReference; } });
const replaceReferences_1 = require("./Functions/replaceReferences");
Object.defineProperty(exports, "replaceReferences", { enumerable: true, get: function () { return replaceReferences_1.replaceReferences; } });
const save_1 = require("./Functions/save");
Object.defineProperty(exports, "save", { enumerable: true, get: function () { return save_1.save; } });
const truncate_1 = require("./Functions/truncate");
Object.defineProperty(exports, "truncate", { enumerable: true, get: function () { return truncate_1.truncate; } });
const update_1 = require("./Functions/update");
Object.defineProperty(exports, "update", { enumerable: true, get: function () { return update_1.update; } });
const idConverter_1 = require("./Functions/idConverter");
Object.defineProperty(exports, "idConverter", { enumerable: true, get: function () { return idConverter_1.idConverter; } });
const flushCache_1 = require("./Functions/flushCache");
Object.defineProperty(exports, "flushCache", { enumerable: true, get: function () { return flushCache_1.flushCache; } });
const native_1 = require("./Functions/native");
Object.defineProperty(exports, "native", { enumerable: true, get: function () { return native_1.native; } });
const replace_1 = require("./Functions/replace");
Object.defineProperty(exports, "replace", { enumerable: true, get: function () { return replace_1.replace; } });
const findOne_1 = require("./Functions/Helpers/findOne");
Object.defineProperty(exports, "findOne", { enumerable: true, get: function () { return findOne_1.findOne; } });
const getAndRemove_1 = require("./Functions/Helpers/getAndRemove");
Object.defineProperty(exports, "getAndRemove", { enumerable: true, get: function () { return getAndRemove_1.getAndRemove; } });
const getAndReplace_1 = require("./Functions/Helpers/getAndReplace");
Object.defineProperty(exports, "getAndReplace", { enumerable: true, get: function () { return getAndReplace_1.getAndReplace; } });
const getAndUpdate_1 = require("./Functions/Helpers/getAndUpdate");
Object.defineProperty(exports, "getAndUpdate", { enumerable: true, get: function () { return getAndUpdate_1.getAndUpdate; } });
const multiply_1 = require("./Functions/multiply");
Object.defineProperty(exports, "multiply", { enumerable: true, get: function () { return multiply_1.multiply; } });
const increment_1 = require("./Functions/increment");
Object.defineProperty(exports, "increment", { enumerable: true, get: function () { return increment_1.increment; } });
const push_1 = require("./Functions/push");
Object.defineProperty(exports, "push", { enumerable: true, get: function () { return push_1.push; } });
const pull_1 = require("./Functions/pull");
Object.defineProperty(exports, "pull", { enumerable: true, get: function () { return pull_1.pull; } });
const aggregate = (collectionId) => new data_aggregate_1.WeivDataAggregate(collectionId);
exports.aggregate = aggregate;
const query = (collectionId) => new data_query_1.WeivDataQuery(collectionId);
exports.query = query;
const filter = () => new data_filter_1.WeivDataFilter();
exports.filter = filter;
exports.default = {
    query,
    filter,
    aggregate,
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
