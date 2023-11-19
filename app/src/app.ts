import { ExWeivDataAggregate } from "./DataAggregate/data_aggregate";
import { ExWeivDataFilter } from "./DataFilter/data_filter";
import { cleanupClientConnections } from './Connection/connection_provider';
import { ExWeivDataQuery } from './DataQuery/data_query';
import { insert } from './Functions/insert';
import { update } from './Functions/update';
import { get } from './Functions/get';
import { save } from './Functions/save'
import { remove } from './Functions/remove'
import { truncate } from './Functions/truncate'

type weivData = {
    aggregate: typeof ExWeivDataAggregate
    bulkInsert: Function,
    bulkRemove: Function,
    bulkSave: Function,
    bulkUpdate: Function,
    get: typeof get,
    insert: typeof insert,
    insertReference: Function,
    isReferenced: Function,
    queryReferenced: Function,
    remove: typeof remove,
    removeReferenced: Function,
    replaceReferences: Function,
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
    truncate: truncate
};

export = weivData;
