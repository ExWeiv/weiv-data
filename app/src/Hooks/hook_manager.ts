// This is the location of Wix websites backends. This might change in the future so be aware of this. Use fs to check where is the backend folder from current location in case of this get's broken.

//@ts-ignore
import * as data_hooks from '../../../../../../../../../user-code/backend/WeivData/data';
import { HookArgs, HookName, HooksResult, CollectionID } from '../../weivdata';
import { splitCollectionId } from '../Helpers/name_helpers';

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