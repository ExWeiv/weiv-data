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
            if (currentUser.loggedIn === true) {
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
        throw Error(`Error on getting URI for MongoDB based on permission of current user: ${err}`);
    }
}

const getVisitorURI = async (): Promise<PermissionsReturn> => {
    try {
        //Direct Visitor (not logged in)
        const cachedVisitorURI: string | undefined = cache.get("VisitorMongoDB_URI");
        if (cachedVisitorURI) {
            return { uri: cachedVisitorURI };
        }

        const secret = await getCachedSecret("VisitorURI");
        cache.set("VisitorMongoDB_URI", secret.toString(), 3600 * 2);
        return { uri: secret }
    } catch (err) {
        throw Error(`Error when getting VisitorURI: ${err}`);
    }
}

const getAdminURI = async (): Promise<PermissionsReturn> => {
    try {
        //Direct Admin (permission is bypassed)
        const cachedAdminURI: string | undefined = cache.get("AdminMongoDB_URI");
        if (cachedAdminURI) {
            return {
                uri: cachedAdminURI,
                memberId: currentUser.id
            };
        }

        const secret = await getCachedSecret("AdminURI");
        cache.set("AdminMongoDB_URI", secret.toString(), 3600);
        return {
            uri: secret,
            memberId: currentUser.id
        }
    } catch (err) {
        throw Error(`Error when getting AdminURI: ${err}`);
    }
}

const getMemberURI = async (): Promise<PermissionsReturn> => {
    try {
        //Direct Member (logged in)
        const cachedMemberURI: string | undefined = cache.get(`MemberMongoDB_URI${currentUser.id}`);
        if (cachedMemberURI) {
            return {
                uri: cachedMemberURI,
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

        const secret = await getCachedSecret("MemberURI");
        cache.set(`MemberMongoDB_URI${currentUser.id}`, secret, 3600);
        return {
            uri: secret,
            memberId: currentUser.id
        }
    } catch (err) {
        throw Error(`Error when getting MemberURI: ${err}`);
    }
}