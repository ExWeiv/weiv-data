//@ts-ignore
import { currentUser } from "wix-users-backend";

import { getCachedSecret } from '../Helpers/secret_helpers';
import NodeCache from 'node-cache';
import type { CustomOptionsRole } from '../Helpers/connection_helpers';
import CryptoJS from 'crypto-js';
import { getSecretKey } from '../Helpers/encrypt_helpers';
import { logMessage } from "../Helpers/log_helpers";

/**@internal */
export type GetMongoURIResult = {
    uri: string,
    memberId?: string,
    role: CustomOptionsRole
}

/*
This is a global cache for this file which is used to cache data in it.
*/
const cache = new NodeCache({ useClones: false, deleteOnExpire: true });

/**
 * @description Get's the current member and returns the URI with permissions based on that
 * @param suppressAuth Bypass permissions or use existing member/visitor permissions
 * @returns An object with the MongoClient connection `URI` and if possible `memberId`
 */
export async function getMongoURI(suppressAuth: boolean = false): Promise<GetMongoURIResult> {
    try {
        logMessage("getMongoURI function called to get required connection uri based on visitor role");

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
        throw new Error(`Error on getting URI for MongoDB based on permission of current user: ${err}`);
    }
}

/**
 * @function
 * @description Gets the visitor URI with cache system enabled.
 * 
 * @returns 
 */
const getVisitorURI = async (): Promise<GetMongoURIResult> => {
    try {
        logMessage(`We are searching connection uri for visitors`);

        //Direct Visitor (not logged in)
        const cachedEncryptedVisitorURI = cache.get<CryptoJS.lib.CipherParams>("VisitorMongoDB_URI");
        if (cachedEncryptedVisitorURI) {
            const cachedVisitorURI = await decryptURI(cachedEncryptedVisitorURI);
            return { uri: cachedVisitorURI, role: "visitorClientOptions" };
        }

        const secret = await getSecretURI("visitor");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set<CryptoJS.lib.CipherParams>("VisitorMongoDB_URI", encryptedURI, 60 * 5);
            return { uri: secret, role: "visitorClientOptions" }
        } else {
            throw new Error(`WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    } catch (err) {
        throw new Error(`Error when getting VisitorURI: ${err}`);
    }
}

/**
 * @function
 * @description Gets the admin URI with cache system enabled.
 * 
 * @returns 
 */
const getAdminURI = async (): Promise<GetMongoURIResult> => {
    try {
        logMessage(`We are searching connection uri for admins`);

        //Direct Admin (permission is bypassed)
        const cachedEncryptedAdminURI = cache.get<CryptoJS.lib.CipherParams>("AdminMongoDB_URI");
        if (cachedEncryptedAdminURI) {
            const cachedAdminURI = await decryptURI(cachedEncryptedAdminURI);
            return {
                uri: cachedAdminURI,
                memberId: currentUser.id,
                role: "adminClientOptions"
            };
        }

        const secret = await getSecretURI("admin");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set<CryptoJS.lib.CipherParams>("AdminMongoDB_URI", encryptedURI, 60 * 5);
            return {
                uri: secret,
                memberId: currentUser.id,
                role: "adminClientOptions"
            }
        } else {
            throw new Error(`WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    } catch (err) {
        throw new Error(`Error when getting AdminURI: ${err}`);
    }
}

/**
 * @function
 * @description Gets the member URI with cache system enabled.
 * 
 * @returns 
 */
const getMemberURI = async (): Promise<GetMongoURIResult> => {
    try {
        logMessage(`We are searching connection uri for members`);

        //Direct Member (logged in)
        const cachedEncryptedMemberURI = cache.get<CryptoJS.lib.CipherParams>(`MemberURI${currentUser.id}`);
        if (cachedEncryptedMemberURI) {
            const cachedMemberURI = await decryptURI(cachedEncryptedMemberURI);
            logMessage(`We have found cached URI (members) so we are returning it`);
            return {
                uri: cachedMemberURI,
                memberId: currentUser.id,
                role: "memberClientOptions"
            }
        }

        logMessage(`We are now checking member roles to see if this member is an Admin?`);
        const cachedRole: string | undefined = cache.get(`MemberRoles${currentUser.id}`);
        if (cachedRole) {
            if (cachedRole === "Admin") {
                logMessage(`Member is Admin so we are getting admin URI not member URI`);
                return getAdminURI();
            }
        }

        const roles = await currentUser.getRoles();
        if (roles.length > 0) {
            cache.set(`MemberRoles${currentUser.id}`, roles[0].name, 60 * 5);

            // Check for admin role in current member
            const isAdmin = (roles as any[]).filter((role) => {
                return role.name === "Admin";
            }).length > 0;

            if (isAdmin) {
                logMessage(`Member is Admin so we are getting admin URI not member URI, (role fetched via APIs)`);
                return getAdminURI();
            }
        } else {
            logMessage("We didn't find any specific (admin) role for this member, so we will return member URI.");
            cache.set(`MemberRoles${currentUser.id}`, "Member", 60 * 5);
        }

        const secret = await getSecretURI("member");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set<CryptoJS.lib.CipherParams>(`MemberURI${currentUser.id}`, encryptedURI, 60 * 5);

            return {
                uri: secret,
                memberId: currentUser.id,
                role: "memberClientOptions"
            }
        } else {
            throw new Error(`WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    } catch (err) {
        throw new Error(`Error when getting MemberURI: ${err}`);
    }
}

/**@internal */
export function getPermissionsCache() {
    return cache;
}

const encryptURI = async (uri: string) => {
    const secret = await getSecretKey();
    const encrypted = CryptoJS.AES.encrypt(uri, secret, {
        mode: CryptoJS.mode.CBC,
        paddding: CryptoJS.pad.Pkcs7,
        iv: CryptoJS.lib.WordArray.random(16)
    })
    return encrypted;
}

const decryptURI = async (encryptedURI: CryptoJS.lib.CipherParams) => {
    const secret = await getSecretKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedURI, secret, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: encryptedURI.iv
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

const getSecretURI = async (uri: "admin" | "member" | "visitor"): Promise<string> => {
    try {
        logMessage(`getSecretURI working for ${uri}`);
        const secret = await getCachedSecret<"URI">("WeivDataURIs", true);
        return secret[uri];
    } catch (err) {
        throw new Error(`WeivData - Error when getting connection URI from secret manager via getCachedSecret helper function, ${err}`);
    }
}