//@ts-ignore
import wixData from 'wix-data';
//@ts-ignore
import { currentUser } from 'wix-users-backend';
import { logMessage } from './log_helpers';

export async function getOwnerId(enableVisitorId: boolean = false): Promise<string | null> {
    try {
        logMessage(`getOwnerId function is called so now we will try to find or get the current user's ID, enableVisitorId = ${enableVisitorId}`)
        if (currentUser.loggedIn) {
            logMessage(`User is alreaddy logged-in so we get the memberId: ${currentUser.id}`);
            return currentUser.id;
        } else if (enableVisitorId === true) {
            logMessage(`User is not logged-in but enableVisitorId = ${enableVisitorId} (should be true) and now we will try to find the visitor id via WixData`);
            // If member not logged-in create temp data and get the visitor_id from _owner field of created item.
            const { _owner, _id } = await wixData.insert("WeivOwnerID", {}, { supressAuth: true });
            wixData.remove("WeivOwnerID", _id, { suppressAuth: true });
            logMessage(`We have created a new item in WeivOwnerID collection which lives in WixData to get visitor id and this is what we found: ${_owner}, (same item is also deleted after created)`);
            return _owner;
        } else {
            logMessage(`Current user is not logged-in and enableVisitorId = ${enableVisitorId} (should be false) so we will return null`);
            return null;
        }
    } catch (err) {
        throw new Error(`Error when checking user id: (Possible Velo API BUG) ${err}`);
    }
}