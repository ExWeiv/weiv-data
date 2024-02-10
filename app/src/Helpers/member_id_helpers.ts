//@ts-ignore
import wixData from 'wix-data'; //@ts-ignore
import { currentUser } from 'wix-users-backend';

/**
 * When you want to get not just only members or admins id (member id in Wix) also visitors id enable this and system will create a data using wix-data and then it will use the _owner field to get the current user temp id.
 * Note: This will slow down the operation and not recommended always so do not use it when you don't need it. Carefully design your database systems/models and your apps workflows because you shouldn't need this in most cases.
 * 
 * @public
 */
export type EnableVisitorID = boolean;

export async function getOwnerId(enableVisitorId: EnableVisitorID = false): Promise<string | null> {
    try {
        if (currentUser.loggedIn) {
            return currentUser.id;
        } else if (enableVisitorId === true) {
            // If member not logged-in create temp data and get the visitor_id from _owner field of created item.
            const { _owner, _id } = await wixData.insert("WeivOwnerID", {});
            wixData.remove("WeivOwnerID", _id, { suppressAuth: true });
            return _owner;
        } else {
            return null;
        }
    } catch (err) {
        throw Error(`WeivData - Error when checking user id: (Possible Velo API BUG) ${err}`);
    }
}