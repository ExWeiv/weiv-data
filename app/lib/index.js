"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncWixApps = exports._version = exports.listCollections = exports.renameCollection = exports.deleteCollection = exports.createCollection = exports.pull = exports.push = exports.increment = exports.multiply = exports.getAndUpdate = exports.getAndReplace = exports.getAndRemove = exports.findOne = exports.replace = exports.native = exports.flushCache = exports.convertIdToString = exports.convertIdToObjectId = exports.update = exports.truncate = exports.save = exports.replaceReferences = exports.removeReference = exports.remove = exports.isReferenced = exports.insertReference = exports.insert = exports.get = exports.bulkUpdate = exports.bulkSave = exports.bulkRemove = exports.bulkInsert = exports.queryReferenced = exports.aggregate = exports.filter = exports.query = void 0;
const aggregate_data_1 = require("./Aggregate/aggregate_data");
const data_filter_1 = require("./Filter/data_filter");
const query_data_1 = require("./Query/query_data");
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
const id_converters_1 = require("./Functions/id_converters");
Object.defineProperty(exports, "convertIdToObjectId", { enumerable: true, get: function () { return id_converters_1.convertIdToObjectId; } });
Object.defineProperty(exports, "convertIdToString", { enumerable: true, get: function () { return id_converters_1.convertIdToString; } });
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
const createCollection_1 = require("./Collections/createCollection");
Object.defineProperty(exports, "createCollection", { enumerable: true, get: function () { return createCollection_1.createCollection; } });
const deleteCollection_1 = require("./Collections/deleteCollection");
Object.defineProperty(exports, "deleteCollection", { enumerable: true, get: function () { return deleteCollection_1.deleteCollection; } });
const renameCollection_1 = require("./Collections/renameCollection");
Object.defineProperty(exports, "renameCollection", { enumerable: true, get: function () { return renameCollection_1.renameCollection; } });
const listCollections_1 = require("./Collections/listCollections");
Object.defineProperty(exports, "listCollections", { enumerable: true, get: function () { return listCollections_1.listCollections; } });
const package_json_1 = __importDefault(require("../package.json"));
const aggregate = (collectionId) => new aggregate_data_1.AggregateResult(collectionId);
exports.aggregate = aggregate;
const query = (collectionId) => new query_data_1.QueryResult(collectionId);
exports.query = query;
const filter = () => new data_filter_1.WeivDataFilter();
exports.filter = filter;
const _version = () => package_json_1.default.version;
exports._version = _version;
const wix_members_1 = require("./Apps/wix_members");
const wix_stores_1 = require("./Apps/wix_stores");
const SyncWixApps = {
    wixMembers: { onMemberCreated: wix_members_1.onMemberCreated, onMemberUpdated: wix_members_1.onMemberUpdated, onMemberDeleted: wix_members_1.onMemberDeleted, onBadgeCreated: wix_members_1.onBadgeCreated, onBadgeUpdated: wix_members_1.onBadgeUpdated, onBadgeDeleted: wix_members_1.onBadgeDeleted },
    wixStores: { onCollectionCreated: wix_stores_1.onCollectionCreated, onCollectionUpdated: wix_stores_1.onCollectionUpdated, onCollectionDeleted: wix_stores_1.onCollectionDeleted, onProductCreated: wix_stores_1.onProductCreated, onProductUpdated: wix_stores_1.onProductUpdated, onProductDeleted: wix_stores_1.onProductDeleted }
};
exports.SyncWixApps = SyncWixApps;
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
    convertIdToObjectId: id_converters_1.convertIdToObjectId,
    convertIdToString: id_converters_1.convertIdToString,
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
    pull: pull_1.pull,
    createCollection: createCollection_1.createCollection,
    deleteCollection: deleteCollection_1.deleteCollection,
    renameCollection: renameCollection_1.renameCollection,
    listCollections: listCollections_1.listCollections,
    _version,
    SyncWixApps
};
