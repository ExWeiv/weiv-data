//@ts-ignore
import { currentMember } from "wix-members-backend"; //@ts-ignore
import { getCachedSecret } from './secret_helpers';

/**
 * @description Get's the current member and returns the URI with permissions based on that
 * @param suppressAuth Bypass permissions or use existing member/visitor permissions
 * @returns An object with the MongoClient connection `URI` and if possible `memberId`
 */
export async function getMemberURI(
    suppressAuth = false
): Promise<PermissionsReturn> {
    try {
        if (suppressAuth != true) {
            const { title } = await currentMember.getRoles()[0];
            if (title === "Admin") {
                const uri = await getCachedSecret("AdminURI");
                return { uri };
            } else {
                const { _id } = await currentMember.getMember();
                const uri = await getCachedSecret("MemberURI");
                return { memberId: _id, uri };
            }
        } else {
            //Permissions Unchecked
            const uri = await getCachedSecret("AdminURI");
            return { uri };
        };
    } catch (err) {
        console.error("Error on getting URI for MongoDB", err);
        //If Function Rejected Return Visitor Permission
        const uri = await getCachedSecret("VisitorURI");
        return { uri };
    }
}
