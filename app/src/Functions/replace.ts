import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptions } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';

export async function replace(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<Item> {
    try {
        const { safeItem, safeOptions } = await validateParams<'replace'>({ collectionId, item, options }, ["collectionId", "item"], "replace");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeReplace'>(collectionId, "beforeReplace", [safeItem, context]).catch((err) => {
                throw new Error(`beforeReplace Hook Failure ${err}`);
            });
        }

        const itemId = !editedItem ? convertStringId(safeItem._id) : convertStringId(editedItem._id);
        const replaceItem = !editedItem ? safeItem : editedItem;
        delete replaceItem._id;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const value = await collection.findOneAndReplace(
            { _id: itemId },
            { ...replaceItem, _updatedDate: new Date() },
            { readConcern, returnDocument: "after", includeResultMetadata: false }
        );

        if (value) {
            if (suppressHooks != true) {
                let editedResult = await runDataHook<'afterReplace'>(collectionId, "afterReplace", [value, context]).catch((err) => {
                    throw new Error(`afterReplace Hook Failure ${err}`);
                });

                if (editedResult) {
                    return editedResult;
                }
            }

            return value;
        } else {
            throw new Error(`returned value has problem value: ${value}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when replacing an item: ${err}`);
    }
}