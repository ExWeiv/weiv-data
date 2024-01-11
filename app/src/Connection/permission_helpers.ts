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
                const { value } = await getCachedSecret("AdminURI");
                return { uri: value };
            } else {
                const { _id } = await currentMember.getMember();
                const { value } = await getCachedSecret("MemberURI");
                return { memberId: _id, uri: value };
            }
        } else {
            //Permissions Unchecked
            const { value } = await getCachedSecret("AdminURI");
            return { uri: value };
        };
    } catch (err) {
        console.error("Error on getting URI for MongoDB", err);
        //If Function Rejected Return Visitor Permission
        const { value } = await getCachedSecret("VisitorURI");
        return { uri: value };
    }
}
