// This is the location of Wix websites backends. This might change in the future so be aware of this. Use fs to check where is the backend folder from current location in case of this get's broken.

//@ts-ignore
import * as data_hooks from '../../../../../../../../../user-code/backend/WeivData/data';
import { splitCollectionId } from '../Helpers/name_helpers';
import { type CollectionID } from '../Helpers/collection';
import type { ObjectId } from 'mongodb';
import type { Item } from '../Helpers/collection';
import type { WeivDataQuery } from '../Query/data_query';

/**@internal */
export type HookContext = {
    dbName: string;
    collectionName: string;
    userId?: string;
    userRoles: any[] | undefined;
}

/** @internal */
export type HookName = 'afterCount' | 'afterGet' | 'afterInsert' | 'afterQuery' | 'afterRemove' | 'afterUpdate' | 'beforeCount' | 'beforeGet' | 'beforeInsert' | 'beforeQuery' | 'beforeRemove' | 'beforeUpdate' | 'beforeReplace' | 'afterReplace';

/** @internal */
export type HookArgs<HookName> =
    HookName extends 'beforeGet' ? [item: string | ObjectId, context: HookContext] :
    HookName extends 'afterGet' ? [item: Item, context: HookContext] :
    HookName extends 'beforeCount' ? [item: WeivDataQuery, context: HookContext] :
    HookName extends 'afterCount' ? [item: number, context: HookContext] :
    HookName extends 'beforeInsert' ? [item: Item, context: HookContext] :
    HookName extends 'afterInsert' ? [item: Item, context: HookContext] :
    HookName extends 'beforeQuery' ? [item: WeivDataQuery, context: HookContext] :
    HookName extends 'afterQuery' ? [item: Item, context: HookContext] :
    HookName extends 'beforeRemove' ? [item: string | ObjectId, context: HookContext] :
    HookName extends 'beforeUpdate' ? [item: Item, context: HookContext] :
    HookName extends 'afterUpdate' ? [item: Item, context: HookContext] :
    HookName extends 'beforeReplace' ? [item: Item, context: HookContext] :
    HookName extends 'afterReplace' ? [item: Item, context: HookContext] :
    [item: any, context: HookContext];

/** @internal */
export type HooksResult<HookName> =
    HookName extends 'beforeGet' ? string | ObjectId :
    HookName extends 'afterGet' ? Item :
    HookName extends 'beforeCount' ? WeivDataQuery :
    HookName extends 'afterCount' ? number :
    HookName extends 'beforeInsert' ? Item :
    HookName extends 'beforeQuery' ? WeivDataQuery :
    HookName extends 'afterQuery' ? Item :
    HookName extends 'beforeRemove' ? string | ObjectId :
    HookName extends 'afterUpdate' ? Item :
    HookName extends 'afterReplace' ? Item :
    Item;


function hookExist(collectionId: CollectionID, hookName: HookName): Function | undefined {
    const { collectionName, dbName } = splitCollectionId(collectionId);
    const hook = data_hooks[`${dbName.toLowerCase()}_${collectionName.toLowerCase()}_${hookName}`];
    if (hook) {
        return hook;
    } else {
        return undefined;
    }
}

export async function runDataHook<R>(collectionId: CollectionID, hookName: HookName, args: HookArgs<R>): Promise<HooksResult<R> | undefined> {
    try {
        const hookFunction = hookExist(collectionId, hookName);
        if (hookFunction) {
            const item = await hookFunction(...args);
            return item;
        } else {
            return undefined;
        }
    } catch (err) {
        throw Error(`WeivData - Hook error: ${collectionId}, ${hookName}, err: ${err}`);
    }
}