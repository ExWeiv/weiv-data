import { ExWeivDataAggregate } from "./DataAggregate/data_aggregate";
import { ExWeivDataFilter } from "./DataFilter/data_filter";
import { cleanupClientConnections } from './Connection/connection_provider';
import { ExWeivDataQuery } from './DataQuery/data_query';
import { insert } from './Functions/insert';
import { update } from './Functions/update';
import { get } from './Functions/get';
import { save } from './Functions/save';
import { remove } from './Functions/remove';
import { truncate } from './Functions/truncate';
import { insertReference } from './Functions/insertReference';
import { replaceReferences } from './Functions/replaceReferences';
import { isReferenced } from './Functions/isReferenced';
import { removeReference } from './Functions/removeReference';

type weivData = {
    aggregate: typeof ExWeivDataAggregate
    bulkInsert: Function,
    bulkRemove: Function,
    bulkSave: Function,
    bulkUpdate: Function,
    get: typeof get,
    insert: typeof insert,
    insertReference: typeof insertReference,
    isReferenced: typeof isReferenced,
    queryReferenced: Function,
    remove: typeof remove,
    removeReference: typeof removeReference,
    replaceReferences: typeof replaceReferences,
    save: typeof save,
    truncate: typeof truncate,
    update: typeof update,
    filter: typeof ExWeivDataFilter
    cleanup: typeof cleanupClientConnections
    query: typeof ExWeivDataQuery
}

const weivData: weivData = {
    aggregate: ExWeivDataAggregate,
    filter: ExWeivDataFilter,
    cleanup: cleanupClientConnections,
    query: ExWeivDataQuery,
    insert: insert,
    update: update,
    get: get,
    save: save,
    remove: remove,
    truncate: truncate,
    insertReference: insertReference,
    replaceReferences: replaceReferences,
    isReferenced: isReferenced,
    removeReference: removeReference
};

export = weivData;
