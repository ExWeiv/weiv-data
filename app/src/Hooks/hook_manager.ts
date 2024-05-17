// This is the location of Wix websites backends. This might change in the future so be aware of this. Use fs to check where is the backend folder from current location in case of this get's broken.

//@ts-ignore
import * as data_hooks from '../../../../../../../../../user-code/backend/WeivData/data';

import { splitCollectionId } from '../Helpers/name_helpers';
import type { Item, ItemID, CollectionID, Hooks } from '@exweiv/weiv-data'
import type { WeivDataQuery } from '../Query/data_query';
import { prepareHookContext } from '../Helpers/hook_helpers';

type HookArgs<HookName> =
    HookName extends 'beforeGet' ? [item: ItemID, context: Hooks.HookContext] :
    HookName extends 'beforeCount' ? [item: WeivDataQuery, context: Hooks.HookContext] :
    HookName extends 'afterCount' ? [item: number, context: Hooks.HookContext] :
    HookName extends 'beforeQuery' ? [item: WeivDataQuery, context: Hooks.HookContext] :
    HookName extends 'beforeRemove' ? [item: ItemID, context: Hooks.HookContext] :
    HookName extends 'beforeFindOne' ? [item: { propertyName: string, value: any }, context: Hooks.HookContext] :
    HookName extends 'beforeGetAndRemove' ? [item: ItemID, context: Hooks.HookContext] :
    HookName extends 'beforeIncrement' ? [item: { propertyName: string, value: number }, context: Hooks.HookContext] :
    HookName extends 'beforeMultiply' ? [item: { propertyName: string, value: number }, context: Hooks.HookContext] :
    HookName extends 'beforePush' ? [item: { propertyName: string, value: any }, context: Hooks.HookContext] :
    HookName extends 'beforePull' ? [item: { propertyName: string, value: any }, context: Hooks.HookContext] :
    [item: Item, context: Hooks.HookContext];

type HooksResults<HookName> =
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


function hookExist(collectionId: CollectionID, hookName: Hooks.HookName): Function | undefined {
    if (typeof hookName !== "string") {
        throw new Error("type of hook name is not string!");
    }

    const { collectionName, dbName } = splitCollectionId(collectionId);
    const hook = data_hooks[`${dbName.toLowerCase()}_${collectionName.toLowerCase()}_${hookName}`];
    if (hook) {
        return hook;
    } else {
        return undefined;
    }
}

export async function runDataHook<R>(collectionId: CollectionID, hookName: Hooks.HookName, args: HookArgs<R>): Promise<HooksResults<R> | undefined> {
    try {
        if (typeof hookName !== "string" && typeof collectionId !== "string") {
            throw new Error("type of hook name or collection id is not string!");
        }

        const hookFunction = hookExist(collectionId, hookName);
        if (hookFunction) {
            const item = await hookFunction(...args);
            return item;
        } else {
            return undefined;
        }
    } catch (err) {
        // Send Error to onFailure Hook with Error Object (Only Runs for Hooks not All Actions are Covered)
        const context = prepareHookContext(collectionId);
        runErrorHook(collectionId, new Error(`${err}`), context);
        throw new Error(`WeivData - Hook error: ${collectionId}, ${hookName}, err: ${err}`);
    }
}

export function runErrorHook(collectionId: string, err: Error, context: Hooks.HookContext) {
    console.error(err.message);
    const errorHandlerFunction = hookExist(collectionId, "onFailure");
    if (errorHandlerFunction) {
        errorHandlerFunction(err, context);
    }
}