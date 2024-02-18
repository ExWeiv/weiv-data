/**@public */
export { AggregateRunOptions } from './src/src/Aggregate/data_aggregate';

/**@public */
export { WeivDataAggregateResult } from "./src/Aggregate/data_aggregate_result";

/**@public */
export { WeivDataQueryResult } from './src/Query/data_query_result';

/**@public */
export { WeivDataQueryReferencedResult } from './src/Functions/QueryReferenced/query_referenced_result';

/**@public */
export { WeivDataQueryReferencedOptions } from './src/Functions/QueryReferenced/queryReferenced';

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
} from './src/Helpers/collection';

/**@public */
export { BulkInsertResult } from './src/Functions/bulkInsert';

/**@public */
export { WeivDataBulkRemoveResult } from './src/Functions/bulkRemove';

/**@public */
export { WeivDataBulkSaveResult } from './src/Functions/bulkSave';

/**@public */
export { WeivDataBulkUpdateResult } from './src/Functions/bulkUpdate';

/**@public */
export { WeivDataSaveResult } from './src/Functions/save';

/**@public */
export { IncludeObject } from './src/Query/data_query';

/**@public */
export { CacheSelections } from './src/Functions/flushCache';

/**@public */
export { ReferencedItem, ReferringItem } from './src/Helpers/reference_helpers';

/**@public */
export { HookName, HookArgs, HooksResult, HookContext } from './src/Hooks/hook_manager';