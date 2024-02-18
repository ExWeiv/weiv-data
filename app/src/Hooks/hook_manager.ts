// This is the location of Wix websites backends. This might change in the future so be aware of this. Use fs to check where is the backend folder from current location in case of this get's broken.

//@ts-ignore
import * as data_hooks from '../../../../../../../../../user-code/backend/WeivData/data';
import { splitCollectionId } from '../Helpers/name_helpers';
import { type CollectionID } from '../Helpers/collection';
import type { Item, ItemID } from '../Helpers/collection';
import type { WeivDataQuery } from '../Query/data_query';

/**@public */
export interface HookContext {
    dbName: string;
    collectionName: string;
    userId?: string;
    userRoles: any[] | undefined;
}

/**
 * List of available hooks.
 * 
 * @public */
export type HookName =
    'afterCount' | 'afterGet' | 'afterInsert' | 'afterQuery' | 'afterRemove' | 'afterUpdate' |
    'beforeCount' | 'beforeGet' | 'beforeInsert' | 'beforeQuery' | 'beforeRemove' | 'beforeUpdate' |
    'beforeReplace' | 'afterReplace' | 'beforeFindOne' | 'afterFindOne' | 'beforeGetAndUpdate' |
    'afterGetAndUpdate' | 'beforeGetAndReplace' | 'afterGetAndReplace' | 'beforeGetAndRemove' | 'afterGetAndRemove' |
    'beforeIncrement' | 'afterIncrement' | 'beforeMultiply' | 'afterMultiply' | 'beforePush' | 'afterPush' |
    'beforePull' | 'afterPull';

/**
 * List of hook params and values.
 * 
 * @public */
export type HookArgs<HookName> =
    HookName extends 'beforeGet' ? [item: ItemID, context: HookContext] :
    HookName extends 'beforeCount' ? [item: WeivDataQuery, context: HookContext] :
    HookName extends 'afterCount' ? [item: number, context: HookContext] :
    HookName extends 'beforeQuery' ? [item: WeivDataQuery, context: HookContext] :
    HookName extends 'beforeRemove' ? [item: ItemID, context: HookContext] :
    HookName extends 'beforeFindOne' ? [item: { propertyName: string, value: any }, context: HookContext] :
    HookName extends 'beforeGetAndRemove' ? [item: ItemID, context: HookContext] :
    HookName extends 'beforeIncrement' ? [item: { propertyName: string, value: number }, context: HookContext] :
    HookName extends 'beforeMultiply' ? [item: { propertyName: string, value: number }, context: HookContext] :
    HookName extends 'beforePush' ? [item: { propertyName: string, value: any }, context: HookContext] :
    HookName extends 'beforePull' ? [item: { propertyName: string, value: any }, context: HookContext] :
    [item: Item, context: HookContext];

/**
 * List of expected values from hooks if returns.
 * 
 * @public */
export type HooksResult<HookName> =
    HookName extends 'beforeGet' ? ItemID :
    HookName extends 'beforeCount' ? WeivDataQuery :
    HookName extends 'afterCount' ? number :
    HookName extends 'beforeQuery' ? WeivDataQuery :
    HookName extends 'beforeRemove' ? ItemID :
    HookName extends 'beforeFindOne' ? { propertyName: string, value: any } :
    HookName extends 'beforeGetAndRemove' ? ItemID :
    HookName extends 'beforeIncrement' ? { propertyName: string, value: number } :
    HookName extends 'beforeMultiply' ? { propertyName: string, value: number } :
    HookName extends 'beforePush' ? { propertyName: string, value: any } :
    HookName extends 'beforePull' ? { propertyName: string, value: any } :
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