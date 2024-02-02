//@ts-ignore
import { currentUser } from 'wix-users-backend';
import { splitCollectionId } from './name_helpers';
import { CollectionID, HookContextResult } from '../../weivdata';

export function prepareHookContext(collectionId: CollectionID): HookContextResult {
    const roles = currentUser.getRoles();
    const { dbName, collectionName } = splitCollectionId(collectionId);

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
            userId: null,
            userRoles: roles
        }
    }
}