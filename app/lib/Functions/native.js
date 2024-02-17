"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.native = void 0;
const connection_helpers_1 = require("../Helpers/connection_helpers");
/**
 * Use native MongoDB syntax and perform any action you want inside a collection. This API can be very useful when you need something that doesn't exist in weiv-data library.
 * You don't need to manage clients, permissions etc. instead you will only write the actions you want to take.
 *
 * Anything done with native collection cursor won't trigger any hooks. Handle hooks manually by handling them inside your code.
 *
 * @example
 * ```
 * import weivData from '@exweiv/weiv-data';
 *
 * const nativeCollectionObject = await weivData.native("Finance/Income", false);
 *
 * // Perform actions with native collection cursor provided by MongoDB
 * // Check [MongoDB Atlas APIs (JS)](https://mongodb.github.io/node-mongodb-native/5.9/) to udnerstand how to use it.
 * ```
 *
 * @param collectionId The ID of the collection to remove the item from.
 * @param suppressAuth Set to false by default you can set to true if you want to bypass the permissions and run it as Admin.
 * @returns {Promise<Collection>} Fulfilled - Native MongoDB Collection cursor.
 */
async function native(collectionId, suppressAuth) {
    try {
        if (!collectionId) {
            throw Error(`WeivData - One or more required param is undefined - Required Params: collectionId`);
        }
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        return collection;
    }
    catch (err) {
        throw Error(`WeivData - Error when removing an item from collection: ${err}`);
    }
}
exports.native = native;
