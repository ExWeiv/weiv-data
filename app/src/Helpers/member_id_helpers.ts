//@ts-ignore
import wixData from 'wix-data'; //@ts-ignore
import { currentUser } from 'wix-users-backend';
import { EnableVisitorID } from '../../weiv-data';

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