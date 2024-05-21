import { connectionHandler } from '../Helpers/connection_helpers';
import { convertObjectId, convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptionsOwner } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { ObjectId } from 'mongodb/mongodb';

export async function update(collectionId: CollectionID, item: Item, options?: WeivDataOptionsOwner): Promise<Item> {
    try {
        // Validate Params
        const { safeItem, safeOptions } = await validateParams<"update">({ collectionId, item, options }, ["collectionId", "item"], "update");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner } = safeOptions || {};

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                throw new Error(`beforeUpdate Hook Failure ${err}`);
            });
        }

        const itemId = !editedItem ? convertStringId(safeItem._id) : convertStringId(editedItem._id);
        const updateItem = !editedItem ? safeItem : editedItem;
        delete updateItem._id;

        const filter: { _id: ObjectId, _owner?: string } = { _id: itemId };
        if (onlyOwner) {
            const currentMemberId = await getOwnerId();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const value = await collection.findOneAndUpdate(
            filter,
            { $set: { ...updateItem, _updatedDate: new Date() } },
            { readConcern, returnDocument: "after", includeResultMetadata: false }
        );

        if (value) {
            if (suppressHooks != true) {
                let editedResult = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [value, context]).catch((err) => {
                    throw new Error(`afterUpdate Hook Failure ${err}`);
                });

                if (editedResult) {
                    if (editedResult._id) {
                        editedResult._id = convertObjectId(editedResult._id);
                    }
                    return editedResult;
                }
            }

            if (value._id) {
                return {
                    ...value,
                    _id: convertObjectId(value._id)
                }
            } else {
                return value;
            }
        } else {
            throw new Error(`returned value has problem value: ${value}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when updating an item: ${err}`);
    }
}