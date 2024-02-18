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
export { HookName, HookArgs, HooksResult, HookContext } from './Hooks/hook_manager';