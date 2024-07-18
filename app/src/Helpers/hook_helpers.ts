//@ts-ignore
import { currentUser } from 'wix-users-backend';
import { splitCollectionId } from './name_helpers';
import type { CollectionID } from '@exweiv/weiv-data';

/** @internal */
export type HookContextResult = {
    dbName: string;
    collectionName: string;
    userId?: string;
    userRoles: [];
}

export function prepareHookContext(collectionId: CollectionID): HookContextResult {
    const { dbName, collectionName } = splitCollectionId(collectionId);
    const roles = currentUser.getRoles();

    if (currentUser.loggedIn) {
        return {
            dbName,
            collectionName,
            userId: currentUser.id,
            userRoles: roles
        }
    } else {
        return {
            dbName,
            collectionName,
            userRoles: roles
        }
    }
}