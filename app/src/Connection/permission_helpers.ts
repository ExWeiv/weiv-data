import { currentUser } from "wix-users-backend";
import { getCachedSecret } from './secret_helpers';
import NodeCache from 'node-cache';

const cache = new NodeCache();

/**
 * @description Get's the current member and returns the URI with permissions based on that
 * @param suppressAuth Bypass permissions or use existing member/visitor permissions
 * @returns An object with the MongoClient connection `URI` and if possible `memberId`
 */
export async function getMongoURI(suppressAuth = false): Promise<PermissionsReturn> {
    try {
        if (suppressAuth != true) {
            if (currentUser.loggedIn) {
                //Direct Member (logged in)
                return getMemberURI();
            } else {
                //Direct Visitor (not logged in)
                return getVisitorURI();
            }
        } else {
            //Direct Admin (permission is bypassed)
            return getAdminURI();
        }
    } catch (err) {
        console.error("Error on getting URI for MongoDB based on permission of current user", err);
        return getVisitorURI();
    }
}

const getVisitorURI = async (): Promise<PermissionsReturn> => {
    //Direct Visitor (not logged in)
    const cachedVisitorURI: { value: string } | undefined = cache.get("VisitorMongoDB_URI");
    if (cachedVisitorURI) {
        return { uri: cachedVisitorURI };
    }

    const { value } = await getCachedSecret("VisitorURI");
    cache.set("VisitorMongoDB_URI", value, 3600 * 2);
    return { uri: { value } }
}

const getAdminURI = async (): Promise<PermissionsReturn> => {
    //Direct Admin (permission is bypassed)
    const cachedAdminURI: string | undefined = cache.get("AdminMongoDB_URI");
    if (cachedAdminURI) {
        return {
            uri: { value: cachedAdminURI },
            memberId: currentUser.id
        };
    }

    const { value } = await getCachedSecret("AdminURI");
    cache.set("AdminMongoDB_URI", value, 3600);
    return {
        uri: { value },
        memberId: currentUser.id
    }
}

const getMemberURI = async (): Promise<PermissionsReturn> => {
    //Direct Member (logged in)
    const cachedMemberURI: string | undefined = cache.get(`MemberMongoDB_URI${currentUser.id}`);
    if (cachedMemberURI) {
        return {
            uri: { value: cachedMemberURI },
            memberId: currentUser.id
        }
    }

    const cachedRole: string | undefined = cache.get(`MemberRoles${currentUser.id}`);
    if (cachedRole) {
        if (cachedRole === "Admin") {
            return getAdminURI();
        }
    }

    const roles = await currentUser.getRoles();
    if (roles.length > 0) {
        cache.set(`MemberRoles${currentUser.id}`, roles[0].name, 3600 * 2);
        if (roles[0].name === "Admin") {
            return getAdminURI();
        }
    } else {
        cache.set(`MemberRoles${currentUser.id}`, "Member", 3600 * 2);
    }

    const { value } = await getCachedSecret("MemberURI");
    cache.set(`MemberMongoDB_URI${currentUser.id}`, value, 3600);
    return {
        uri: { value },
        memberId: currentUser.id
    }
}