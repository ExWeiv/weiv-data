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
import { convertIdToObjectId, convertIdToString } from './Functions/id_converters';
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

import * as wixMembers from "./Apps/wix_members";
import * as wixStores from "./Apps/wix_stores";
import * as wixBlog from "./Apps/wix_blog";
import * as wixEcom from "./Apps/wix_ecom";
import * as wixMarketing from "./Apps/wix_marketing";
import * as wixPricingPlans from "./Apps/wix_pricingplans";

const SyncWixApps = {
    wixBlog,
    wixEcom,
    wixMarketing,
    wixMembers,
    wixPricingPlans,
    wixStores,
};

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
    convertIdToObjectId,
    convertIdToString,
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
    _version,
    SyncWixApps
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
    convertIdToObjectId,
    convertIdToString,
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
    _version,
    SyncWixApps
}