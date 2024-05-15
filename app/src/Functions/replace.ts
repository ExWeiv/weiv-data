import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptions } from '@exweiv/weiv-data';
import { ObjectId } from 'mongodb';
import { validateParams } from '../Helpers/validator';

export async function replace(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<Item> {
    try {
        const { safeItem, safeOptions } = await validateParams<'replace'>({ collectionId, item, options }, ["collectionId", "item"], "replace");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeReplace'>(collectionId, "beforeReplace", [safeItem, context]).catch((err) => {
                throw Error(`WeivData - beforeReplace Hook Failure ${err}`);
            });
        }

        const itemId = !editedItem ? convertStringId(safeItem._id) : convertStringId(editedItem._id);
        const replaceItem = !editedItem ? safeItem : editedItem;
        const filter = !itemId ? { _id: new ObjectId() } : { _id: itemId };
        delete replaceItem._id;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const value = await collection.findOneAndReplace(
            filter,
            { $set: { ...replaceItem, _updatedDate: new Date() } },
            { readConcern: readConcern ? readConcern : "local", returnDocument: "after", includeResultMetadata: false }
        );

        if (value) {
            if (suppressHooks != true) {
                let editedResult = await runDataHook<'afterReplace'>(collectionId, "afterReplace", [value, context]).catch((err) => {
                    throw Error(`WeivData - afterReplace Hook Failure ${err}`);
                });

                if (editedResult) {
                    return editedResult;
                }
            }

            return value;
        } else {
            throw Error(`WeivData - Error when replacing an item, returned value: ${value}`);
        }
    } catch (err) {
        throw Error(`WeivData - Error when replacing an item: ${err}`);
    }
}