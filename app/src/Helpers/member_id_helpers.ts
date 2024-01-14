import wixData from 'wix-data';
import { currentMember } from 'wix-members-backend';
import { currentUser } from 'wix-users-backend';

export async function getOwnerId(): Promise<string> {
    try {
        if (currentUser.loggedIn) {
            // Check if member is already logged-in and get the memberId directly.
            const { _id } = await currentMember.getMember({ fieldsets: ['PUBLIC'] });
            return _id;
        } else {
            // If member not logged-in create temp data and get the visitor_id from _owner field of created item.
            const { _owner } = await wixData.insert("WeivOwnerID", {});
            return _owner;
        }
    } catch (err) {
        throw Error(`WeivData - Error when checking user id: (Possible Velo API BUG) ${err}`);
    }
}