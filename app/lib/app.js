"use strict";
//---------------------------------------------//
//                Classes                      //
//---------------------------------------------//
Object.defineProperty(exports, "__esModule", { value: true });
exports.flushCache = exports.idConverter = exports.update = exports.truncate = exports.save = exports.replaceReferences = exports.removeReference = exports.remove = exports.isReferenced = exports.insertReference = exports.insert = exports.get = exports.bulkUpdate = exports.bulkSave = exports.bulkRemove = exports.bulkInsert = exports.queryReferenced = exports.WeivDataQuery = exports.WeivDataFilter = exports.WeivDataAggregate = void 0;
/**@public */
var data_aggregate_1 = require("./Aggregate/data_aggregate");
Object.defineProperty(exports, "WeivDataAggregate", { enumerable: true, get: function () { return data_aggregate_1.WeivDataAggregate; } });
/**@public */
var data_filter_1 = require("./Filter/data_filter");
Object.defineProperty(exports, "WeivDataFilter", { enumerable: true, get: function () { return data_filter_1.WeivDataFilter; } });
/**@public */
var data_query_1 = require("./Query/data_query");
Object.defineProperty(exports, "WeivDataQuery", { enumerable: true, get: function () { return data_query_1.WeivDataQuery; } });
//---------------------------------------------//
//                Functions                    //
//---------------------------------------------//
/**@public */
var queryReferenced_1 = require("./Functions/QueryReferenced/queryReferenced");
Object.defineProperty(exports, "queryReferenced", { enumerable: true, get: function () { return queryReferenced_1.queryReferenced; } });
/**@public */
var bulkInsert_1 = require("./Functions/bulkInsert");
Object.defineProperty(exports, "bulkInsert", { enumerable: true, get: function () { return bulkInsert_1.bulkInsert; } });
/**@public */
var bulkRemove_1 = require("./Functions/bulkRemove");
Object.defineProperty(exports, "bulkRemove", { enumerable: true, get: function () { return bulkRemove_1.bulkRemove; } });
/**@public */
var bulkSave_1 = require("./Functions/bulkSave");
Object.defineProperty(exports, "bulkSave", { enumerable: true, get: function () { return bulkSave_1.bulkSave; } });
/**@public */
var bulkUpdate_1 = require("./Functions/bulkUpdate");
Object.defineProperty(exports, "bulkUpdate", { enumerable: true, get: function () { return bulkUpdate_1.bulkUpdate; } });
/**@public */
var get_1 = require("./Functions/get");
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return get_1.get; } });
/**@public */
var insert_1 = require("./Functions/insert");
Object.defineProperty(exports, "insert", { enumerable: true, get: function () { return insert_1.insert; } });
/**@public */
var insertReference_1 = require("./Functions/insertReference");
Object.defineProperty(exports, "insertReference", { enumerable: true, get: function () { return insertReference_1.insertReference; } });
/**@public */
var isReferenced_1 = require("./Functions/isReferenced");
Object.defineProperty(exports, "isReferenced", { enumerable: true, get: function () { return isReferenced_1.isReferenced; } });
/**@public */
var remove_1 = require("./Functions/remove");
Object.defineProperty(exports, "remove", { enumerable: true, get: function () { return remove_1.remove; } });
/**@public */
var removeReference_1 = require("./Functions/removeReference");
Object.defineProperty(exports, "removeReference", { enumerable: true, get: function () { return removeReference_1.removeReference; } });
/**@public */
var replaceReferences_1 = require("./Functions/replaceReferences");
Object.defineProperty(exports, "replaceReferences", { enumerable: true, get: function () { return replaceReferences_1.replaceReferences; } });
/**@public */
var save_1 = require("./Functions/save");
Object.defineProperty(exports, "save", { enumerable: true, get: function () { return save_1.save; } });
/**@public */
var truncate_1 = require("./Functions/truncate");
Object.defineProperty(exports, "truncate", { enumerable: true, get: function () { return truncate_1.truncate; } });
/**@public */
var update_1 = require("./Functions/update");
Object.defineProperty(exports, "update", { enumerable: true, get: function () { return update_1.update; } });
/**@public */
var idConverter_1 = require("./Functions/idConverter");
Object.defineProperty(exports, "idConverter", { enumerable: true, get: function () { return idConverter_1.idConverter; } });
/**@public */
var flushCache_1 = require("./Functions/flushCache");
Object.defineProperty(exports, "flushCache", { enumerable: true, get: function () { return flushCache_1.flushCache; } });
