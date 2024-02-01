//@ts-ignore
import { currentUser } from 'wix-users-backend';
import { splitCollectionId } from './name_helpers';
import { CollectionID, HookContextReturns } from '../../weiv-data';

export function prepareHookContext(collectionId: CollectionID): HookContextReturns {
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