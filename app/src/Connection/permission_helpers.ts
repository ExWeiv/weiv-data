//@ts-ignore
import { currentUser } from "wix-users-backend";
import { getCachedSecret } from '../Helpers/secret_helpers';
import { CacheableMemory } from 'cacheable';
import type { CustomOptionsRole } from '../Helpers/connection_helpers';
import CryptoJS from 'crypto-js';
import { getSecretKey } from '../Helpers/encrypt_helpers';
import { kaptanLogar } from "../Errors/error_manager";

/**@internal */
export type GetMongoURIResult = {
    uri: string,
    memberId?: string,
    role: CustomOptionsRole
}

/*
This is a global cache for this file which is used to cache data in it.
*/
const cache = new CacheableMemory({ useClone: false, checkInterval: 5000 });

/**
 * @description Get's the current member and returns the URI with permissions based on that
 * @param suppressAuth Bypass permissions or use existing member/visitor permissions
 * @returns An object with the MongoClient connection `URI` and if possible `memberId`
 */
export async function getMongoURI(suppressAuth: boolean = false): Promise<GetMongoURIResult> {
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
        kaptanLogar("00009", `on getting URI for MongoDB based on permission of current user: ${err}`);
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
        //Direct Visitor (not logged in)
        const cachedEncryptedVisitorURI = cache.get<CryptoJS.lib.CipherParams>("VisitorMongoDB_URI");
        if (cachedEncryptedVisitorURI) {
            const cachedVisitorURI = await decryptURI(cachedEncryptedVisitorURI);
            return { uri: cachedVisitorURI, role: "visitorClientOptions" };
        }

        const secret = await getSecretURI("visitor");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set("VisitorMongoDB_URI", encryptedURI, 60 * 5);
            return { uri: secret, role: "visitorClientOptions" }
        } else {
            kaptanLogar("00009", `WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    } catch (err) {
        kaptanLogar("00009", `when getting VisitorURI: ${err}`);
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
            cache.set("AdminMongoDB_URI", encryptedURI, 60 * 5);
            return {
                uri: secret,
                memberId: currentUser.id,
                role: "adminClientOptions"
            }
        } else {
            kaptanLogar("00009", `WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    } catch (err) {
        kaptanLogar("00009", `when getting AdminURI: ${err}`);
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
        //Direct Member (logged in)
        const cachedEncryptedMemberURI = cache.get<CryptoJS.lib.CipherParams>(`MemberURI${currentUser.id}`);
        if (cachedEncryptedMemberURI) {
            const cachedMemberURI = await decryptURI(cachedEncryptedMemberURI);
            return {
                uri: cachedMemberURI,
                memberId: currentUser.id,
                role: "memberClientOptions"
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
            cache.set(`MemberRoles${currentUser.id}`, roles[0].name, 60 * 5);

            // Check for admin role in current member
            const isAdmin = (roles as any[]).filter((role) => {
                return role.name === "Admin";
            }).length > 0;

            if (isAdmin) {
                return getAdminURI();
            }
        } else {
            cache.set(`MemberRoles${currentUser.id}`, "Member", 60 * 5);
        }

        const secret = await getSecretURI("member");
        if (secret) {
            const encryptedURI = await encryptURI(secret);
            cache.set(`MemberURI${currentUser.id}`, encryptedURI, 60 * 5);

            return {
                uri: secret,
                memberId: currentUser.id,
                role: "memberClientOptions"
            }
        } else {
            kaptanLogar("00009", `WeivDataURIs Secret Not Found or Not Configured Correctly`);
        }
    } catch (err) {
        kaptanLogar("00009", `when getting MemberURI: ${err}`);
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
        const secret = await getCachedSecret<"URI">("WeivDataURIs", true);
        return secret[uri];
    } catch (err) {
        kaptanLogar("00009", `when getting connection URI from secret manager via getCachedSecret helper function, ${err}`);
    }
}