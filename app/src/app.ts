//---------------------------------------------//
//                Classes                      //
//---------------------------------------------//

/**@public */
export { WeivDataAggregate } from "./Aggregate/data_aggregate";

/**@public */
export { WeivDataFilter } from "./Filter/data_filter";

/**@public */
export { WeivDataQuery } from './Query/data_query';

//---------------------------------------------//
//                Functions                    //
//---------------------------------------------//
/**@public */
export { queryReferenced } from './Functions/QueryReferenced/queryReferenced';

/**@public */
export { bulkInsert } from './Functions/bulkInsert';

/**@public */
export { bulkRemove } from './Functions/bulkRemove';

/**@public */
export { bulkSave } from './Functions/bulkSave';

/**@public */
export { bulkUpdate } from './Functions/bulkUpdate';

/**@public */
export { get } from './Functions/get';

/**@public */
export { insert } from './Functions/insert';

/**@public */
export { insertReference } from './Functions/insertReference';

/**@public */
export { isReferenced } from './Functions/isReferenced';

/**@public */
export { remove } from './Functions/remove';

/**@public */
export { removeReference } from './Functions/removeReference';

/**@public */
export { replaceReferences } from './Functions/replaceReferences';

/**@public */
export { save } from './Functions/save';

/**@public */
export { truncate } from './Functions/truncate';

/**@public */
export { update } from './Functions/update';

/**@public */
export { idConverter } from './Functions/idConverter';

/**@public */
export { flushCache } from './Functions/flushCache';

/**@public */
export { native } from './Functions/native';

/**@public */
export { replace } from './Functions/replace';

/**@public */
export { findOne } from './Functions/Helpers/findOne';

/**@public */
export { getAndRemove } from './Functions/Helpers/getAndRemove';

/**@public */
export { getAndReplace } from './Functions/Helpers/getAndReplace';

/**@public */
export { getAndUpdate } from './Functions/Helpers/getAndUpdate';

/**@public */
export { increment } from './Functions/increment';

/**@public */
export { multiply } from './Functions/multiply';

/**@public */
export { push } from './Functions/push';

/**@public */
export { pull } from './Functions/pull';

//---------------------------------------------//
//             Types + Interfaces              //
//---------------------------------------------//

/**@public */
export { AggregateRunOptions } from './Aggregate/data_aggregate';

/**@public */
export { WeivDataAggregateResult } from "./Aggregate/data_aggregate_result";

/**@public */
export { WeivDataQueryResult } from './Query/data_query_result';

/**@public */
export { WeivDataQueryReferencedResult } from './Functions/QueryReferenced/query_referenced_result';

/**@public */
export { WeivDataQueryReferencedOptions } from './Functions/QueryReferenced/queryReferenced';

/**@public */
export type {
    SuppressAuth,
    SuppressHooks,
    ConsistentRead,
    EnableVisitorID,
    CollectionID,
    Item,
    ItemID,
    Items,
    ItemIDs,
    WeivDataOptions,
    WeivDataOptionsCache
} from './Helpers/collection';

/**@public */
export { BulkInsertResult } from './Functions/bulkInsert';

/**@public */
export { WeivDataBulkRemoveResult } from './Functions/bulkRemove';

/**@public */
export { WeivDataBulkSaveResult } from './Functions/bulkSave';

/**@public */
export { WeivDataBulkUpdateResult } from './Functions/bulkUpdate';

/**@public */
export { WeivDataSaveResult } from './Functions/save';

/**@public */
export { IncludeObject } from './Query/data_query';

/**@public */
export { CacheSelections } from './Functions/flushCache';

/**@public */
export { ReferencedItem, ReferringItem } from './Helpers/reference_helpers';

/**@public */
export { HookName, HookArgs, HooksResults, HookContext } from './Hooks/hook_manager';