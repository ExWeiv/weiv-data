import { AggregateResult } from "./Aggregate/aggregate_data";
import { WeivDataFilter } from "./Filter/data_filter";
import { QueryResult } from './Query/query_data';
import { queryReferenced } from './Functions/QueryReferenced/queryReferenced';
import { bulkInsert } from './Functions/bulkInsert';
import { bulkRemove } from './Functions/bulkRemove';
import { bulkSave } from './Functions/bulkSave';
import { bulkUpdate } from './Functions/bulkUpdate';
import { get } from './Functions/get';
import { insert } from './Functions/insert';
import { insertReference } from './Functions/insertReference';
import { isReferenced } from './Functions/isReferenced';
import { remove } from './Functions/remove';
import { removeReference } from './Functions/removeReference';
import { replaceReferences } from './Functions/replaceReferences';
import { save } from './Functions/save';
import { truncate } from './Functions/truncate';
import { update } from './Functions/update';
import { convertId } from './Functions/convertId';
import { flushCache } from './Functions/flushCache';
import { native } from './Functions/native';
import { replace } from './Functions/replace';
import { findOne } from './Functions/Helpers/findOne';
import { getAndRemove } from './Functions/Helpers/getAndRemove';
import { getAndReplace } from './Functions/Helpers/getAndReplace';
import { getAndUpdate } from './Functions/Helpers/getAndUpdate';
import { multiply } from './Functions/multiply';
import { increment } from './Functions/increment';
import { push } from './Functions/push';
import { pull } from './Functions/pull';
import { createCollection } from './Collections/createCollection';
import { deleteCollection } from './Collections/deleteCollection';
import { renameCollection } from './Collections/renameCollection';
import { listCollections } from './Collections/listCollections';
import npm from '../package.json';

/**@internal */
import type { CollectionID } from "@exweiv/weiv-data";

const aggregate = (collectionId: CollectionID) => new AggregateResult(collectionId);
const query = (collectionId: CollectionID) => new QueryResult(collectionId);
const filter = () => new WeivDataFilter();
const _version = () => npm.version;

export {
    query,
    filter,
    aggregate,
    queryReferenced,
    bulkInsert,
    bulkRemove,
    bulkSave,
    bulkUpdate,
    get,
    insert,
    insertReference,
    isReferenced,
    remove,
    removeReference,
    replaceReferences,
    save,
    truncate,
    update,
    convertId,
    flushCache,
    native,
    replace,
    findOne,
    getAndRemove,
    getAndReplace,
    getAndUpdate,
    multiply,
    increment,
    push,
    pull,
    createCollection,
    deleteCollection,
    renameCollection,
    listCollections,
    _version
}

export default {
    query,
    filter,
    aggregate,
    queryReferenced,
    bulkInsert,
    bulkRemove,
    bulkSave,
    bulkUpdate,
    get,
    insert,
    insertReference,
    isReferenced,
    remove,
    removeReference,
    replaceReferences,
    save,
    truncate,
    update,
    convertId,
    flushCache,
    native,
    replace,
    findOne,
    getAndRemove,
    getAndReplace,
    getAndUpdate,
    multiply,
    increment,
    push,
    pull,
    createCollection,
    deleteCollection,
    renameCollection,
    listCollections,
    _version
}