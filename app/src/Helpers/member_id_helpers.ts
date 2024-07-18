//@ts-ignore
import wixData from 'wix-data'; //@ts-ignore
import { currentUser } from 'wix-users-backend';
import { kaptanLogar } from '../Errors/error_manager';

export async function getOwnerId(enableVisitorId: boolean = false): Promise<string | null> {
    try {
        if (currentUser.loggedIn) {
            return currentUser.id;
        } else if (enableVisitorId === true) {
            // If member not logged-in create temp data and get the visitor_id from _owner field of created item.
            const { _owner, _id } = await wixData.insert("WeivOwnerID", {}, { supressAuth: true });
            wixData.remove("WeivOwnerID", _id, { suppressAuth: true });
            return _owner;
        } else {
            return null;
        }
    } catch (err) {
        kaptanLogar("00011", `${err}`);
    }
}