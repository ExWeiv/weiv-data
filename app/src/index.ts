import { WeivDataAggregate } from "./Aggregate/data_aggregate";
import { WeivDataFilter } from "./Filter/data_filter";
import { WeivDataQuery } from './Query/data_query';
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
import { idConvreter } from './Functions/idConverter';
import { flushCache } from './Functions/flushCache';

/**@internal */
import { CollectionID } from "./Helpers/collection";

export = {
    aggregate: (collectionId: CollectionID) => new WeivDataAggregate(collectionId),
    filter: () => new WeivDataFilter(),
    query: (collectionId: CollectionID) => new WeivDataQuery(collectionId),
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
    idConvreter,
    flushCache
}