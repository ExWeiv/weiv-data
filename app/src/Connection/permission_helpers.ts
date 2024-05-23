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
        await logMessage(`getMongoURI function is called, now we will find the required MongoDB connection uri and return it for current request, either frmo cache or secrets, permission bypass: ${suppressAuth}`);

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
        await logMessage(`We are searching connection uri for visitors`);

        //Direct Visitor (not logged in)
        const cachedEncryptedVisitorURI = cache.get<CryptoJS.lib.CipherParams>("VisitorMongoDB_URI");
        if (cachedEncryptedVisitorURI) {
            await logMessage(`We have found cached URI (visitors) so we are returning it`);
            const cachedVisitorURI = await decryptURI(cachedEncryptedVisitorURI);
            return { uri: cachedVisitorURI, role: "visitorClientOptions" };
        }

        const secret = await getSecretURI("visitor");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set<CryptoJS.lib.CipherParams>("VisitorMongoDB_URI", encryptedURI, 60 * 5);
            await logMessage(`We didn't find any connection URI in cache so we got it from secrets manager and now we are returning it (visitors)`);
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
        await logMessage(`We are searching connection uri for admins`);

        //Direct Admin (permission is bypassed)
        const cachedEncryptedAdminURI = cache.get<CryptoJS.lib.CipherParams>("AdminMongoDB_URI");
        if (cachedEncryptedAdminURI) {
            const cachedAdminURI = await decryptURI(cachedEncryptedAdminURI);
            await logMessage(`We have found cached URI (admins) so we are returning it`);
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
            await logMessage(`We didn't find any connection URI in cache so we got it from secrets manager and now we are returning it (admins)`);
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
        await logMessage(`We are searching connection uri for members`);

        //Direct Member (logged in)
        const cachedEncryptedMemberURI = cache.get<CryptoJS.lib.CipherParams>(`MemberMongoDB_URI${currentUser.id}`);
        if (cachedEncryptedMemberURI) {
            const cachedMemberURI = await decryptURI(cachedEncryptedMemberURI);
            await logMessage(`We have found cached URI (members) so we are returning it`);
            return {
                uri: cachedMemberURI,
                memberId: currentUser.id,
                role: "memberClientOptions"
            }
        }

        await logMessage(`We are now checking member roles to see if this member is an Admin?`);
        const cachedRole: string | undefined = cache.get(`MemberRoles${currentUser.id}`);
        if (cachedRole) {
            await logMessage(`We found cached role for this member, cached role: ${cachedRole}`);
            if (cachedRole === "Admin") {
                await logMessage(`Member is Admin so we are getting admin URI not member URI for MongoDB`);
                return getAdminURI();
            }
        }

        await logMessage(`We didn't find any roles in cache so we are searching in Wix Members area via wix-users-backend APIs`);
        const roles = await currentUser.getRoles();
        if (roles.length > 0) {
            await logMessage(`There are some roles belongs to current member so we are saving them to cache`, roles);
            cache.set(`MemberRoles${currentUser.id}`, roles[0].name, 60 * 5);

            // Check for admin role in current member
            const isAdmin = (roles as any[]).filter((role) => {
                return role.name === "Admin";
            }).length > 0;

            if (isAdmin) {
                await logMessage(`Member is Admin so we are getting admin URI not member URI for MongoDB, (role is searched via API)`);
                return getAdminURI();
            }
        } else {
            await logMessage(`We didn't find any roles belongs to this user so we save this user as a normal member`, roles);
            cache.set(`MemberRoles${currentUser.id}`, "Member", 60 * 5);
        }

        const secret = await getSecretURI("member");
        if (secret) {
            await logMessage(`We got the connection URI via getSecretURI function and now we are saving it to cache and returning it`);
            const encryptedURI = await encryptURI(secret);
            cache.set<CryptoJS.lib.CipherParams>(`MemberMongoDB_URI${currentUser.id}`, encryptedURI, 60 * 5);

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
        await logMessage(`getSecretURI working for ${uri}`);
        const secret = await getCachedSecret<"URI">("WeivDataURIs", true);
        return secret[uri];
    } catch (err) {
        throw new Error(`WeivData - Error when getting connection URI from secret manager via getCachedSecret helper function, ${err}`);
    }
}