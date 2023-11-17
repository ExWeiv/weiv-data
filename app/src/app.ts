import { ExWeivDataAggregate } from "./DataAggregate/data_aggregate";
import { ExWeivDataFilter } from "./DataFilter/data_filter";
import { cleanupClientConnections } from './Connection/connection_provider';
import { ExWeivDataQuery } from './DataQuery/data_query';

type weivData = {
    aggregate: typeof ExWeivDataAggregate
    bulkInsert: Function,
    bulkRemove: Function,
    bulkSave: Function,
    bulkUpdate: Function,
    get: Function,
    insert: Function,
    insertReference: Function,
    isReferenced: Function,
    queryReferenced: Function,
    remove: Function,
    removeReferenced: Function,
    replaceReferences: Function,
    save: Function,
    truncate: Function,
    update: Function,
    filter: typeof ExWeivDataFilter
    cleanup: typeof cleanupClientConnections
    query: typeof ExWeivDataQuery
}

const weivData: weivData = {
    aggregate: ExWeivDataAggregate,
    filter: ExWeivDataFilter,
    cleanup: cleanupClientConnections,
    query: ExWeivDataQuery
};

export = weivData;
