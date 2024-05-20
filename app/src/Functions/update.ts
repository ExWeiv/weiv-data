import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptions } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';

export async function update(collectionId: CollectionID, item: Item, options?: WeivDataOptions): Promise<Item> {
    try {
        // Validate Params
        const { safeItem, safeOptions } = await validateParams<"update">({ collectionId, item, options }, ["collectionId", "item"], "update");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern } = safeOptions || {};

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                throw new Error(`beforeUpdate Hook Failure ${err}`);
            });
        }

        const itemId = !editedItem ? convertStringId(safeItem._id) : convertStringId(editedItem._id);
        const updateItem = !editedItem ? safeItem : editedItem;
        delete updateItem._id;

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const value = await collection.findOneAndUpdate(
            { _id: itemId },
            { $set: { ...updateItem, _updatedDate: new Date() } },
            { readConcern, returnDocument: "after", includeResultMetadata: false }
        );

        if (value) {
            if (suppressHooks != true) {
                let editedResult = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [value, context]).catch((err) => {
                    throw new Error(`afterUpdate Hook Failure ${err}`);
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
        throw new Error(`WeivData - Error when updating an item: ${err}`);
    }
}