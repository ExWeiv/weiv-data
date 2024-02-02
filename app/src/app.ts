import { WeivDataAggregate } from "./DataAggregate/data_aggregate";
import { WeivDataFilter } from "./DataFilter/data_filter";
import { cleanupClientConnections } from './Connection/connection_provider';
import { WeivDataQuery } from './DataQuery/data_query';
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
import { bulkInsert } from './Functions/bulkInsert';
import { bulkRemove } from './Functions/bulkRemove';
import { bulkSave } from './Functions/bulkSave';
import { bulkUpdate } from './Functions/bulkUpdate';
import { queryReferenced } from './Functions/QueryReferenced/queryReferenced';

// Types
import { CollectionID } from "../weivdata";

export = {
    aggregate: (collectionId: CollectionID) => new WeivDataAggregate(collectionId),
    filter: () => new WeivDataFilter(),
    cleanup: cleanupClientConnections,
    query: (collectionId: CollectionID) => new WeivDataQuery(collectionId),
    insert: insert,
    update: update,
    get: get,
    save: save,
    remove: remove,
    truncate: truncate,
    insertReference: insertReference,
    replaceReferences: replaceReferences,
    isReferenced: isReferenced,
    removeReference: removeReference,
    bulkInsert: bulkInsert,
    bulkRemove: bulkRemove,
    bulkSave: bulkSave,
    bulkUpdate: bulkUpdate,
    queryReferenced: queryReferenced
};
