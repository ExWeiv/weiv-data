"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idConvreter = exports.update = exports.truncate = exports.save = exports.replaceReferences = exports.removeReference = exports.remove = exports.isReferenced = exports.insertReference = exports.insert = exports.get = exports.bulkUpdate = exports.bulkSave = exports.bulkRemove = exports.bulkInsert = exports.queryReferenced = exports.WeivDataQuery = exports.WeivDataFilter = exports.WeivDataAggregate = void 0;
var data_aggregate_1 = require("./Aggregate/data_aggregate");
Object.defineProperty(exports, "WeivDataAggregate", { enumerable: true, get: function () { return data_aggregate_1.WeivDataAggregate; } });
var data_filter_1 = require("./Filter/data_filter");
Object.defineProperty(exports, "WeivDataFilter", { enumerable: true, get: function () { return data_filter_1.WeivDataFilter; } });
var data_query_1 = require("./Query/data_query");
Object.defineProperty(exports, "WeivDataQuery", { enumerable: true, get: function () { return data_query_1.WeivDataQuery; } });
var queryReferenced_1 = require("./Functions/QueryReferenced/queryReferenced");
Object.defineProperty(exports, "queryReferenced", { enumerable: true, get: function () { return queryReferenced_1.queryReferenced; } });
var bulkInsert_1 = require("./Functions/bulkInsert");
Object.defineProperty(exports, "bulkInsert", { enumerable: true, get: function () { return bulkInsert_1.bulkInsert; } });
var bulkRemove_1 = require("./Functions/bulkRemove");
Object.defineProperty(exports, "bulkRemove", { enumerable: true, get: function () { return bulkRemove_1.bulkRemove; } });
var bulkSave_1 = require("./Functions/bulkSave");
Object.defineProperty(exports, "bulkSave", { enumerable: true, get: function () { return bulkSave_1.bulkSave; } });
var bulkUpdate_1 = require("./Functions/bulkUpdate");
Object.defineProperty(exports, "bulkUpdate", { enumerable: true, get: function () { return bulkUpdate_1.bulkUpdate; } });
var get_1 = require("./Functions/get");
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return get_1.get; } });
var insert_1 = require("./Functions/insert");
Object.defineProperty(exports, "insert", { enumerable: true, get: function () { return insert_1.insert; } });
var insertReference_1 = require("./Functions/insertReference");
Object.defineProperty(exports, "insertReference", { enumerable: true, get: function () { return insertReference_1.insertReference; } });
var isReferenced_1 = require("./Functions/isReferenced");
Object.defineProperty(exports, "isReferenced", { enumerable: true, get: function () { return isReferenced_1.isReferenced; } });
var remove_1 = require("./Functions/remove");
Object.defineProperty(exports, "remove", { enumerable: true, get: function () { return remove_1.remove; } });
var removeReference_1 = require("./Functions/removeReference");
Object.defineProperty(exports, "removeReference", { enumerable: true, get: function () { return removeReference_1.removeReference; } });
var replaceReferences_1 = require("./Functions/replaceReferences");
Object.defineProperty(exports, "replaceReferences", { enumerable: true, get: function () { return replaceReferences_1.replaceReferences; } });
var save_1 = require("./Functions/save");
Object.defineProperty(exports, "save", { enumerable: true, get: function () { return save_1.save; } });
var truncate_1 = require("./Functions/truncate");
Object.defineProperty(exports, "truncate", { enumerable: true, get: function () { return truncate_1.truncate; } });
var update_1 = require("./Functions/update");
Object.defineProperty(exports, "update", { enumerable: true, get: function () { return update_1.update; } });
var idConverter_1 = require("./Functions/idConverter");
Object.defineProperty(exports, "idConvreter", { enumerable: true, get: function () { return idConverter_1.idConvreter; } });
