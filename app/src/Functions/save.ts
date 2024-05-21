import type { CollectionID, Item, SaveResult, WeivDataOptionsWriteOwner } from '@exweiv/weiv-data';
import { connectionHandler } from '../Helpers/connection_helpers';
import { convertStringId } from '../Helpers/item_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { ObjectId } from 'mongodb';
import { validateParams } from '../Helpers/validator';
import { getOwnerId } from '../Helpers/member_id_helpers';

export async function save(collectionId: CollectionID, item: Item, options?: WeivDataOptionsWriteOwner): Promise<SaveResult> {
    try {
        // Validate Params
        const { safeOptions, safeItem } = await validateParams<"save">({ collectionId, item, options }, ["collectionId", "item"], "save");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, enableVisitorId } = safeOptions || {};

        // Convert ID to ObjectId if exist
        let editedItem;
        if (safeItem._id && typeof safeItem._id === "string") {
            // Update
            safeItem._id = convertStringId(safeItem._id);

            if (suppressHooks != true) {
                editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                    throw new Error(`beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        } else {
            // Insert
            safeItem._owner = await getOwnerId(enableVisitorId);

            if (suppressHooks != true) {
                editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [safeItem, context]).catch((err) => {
                    throw new Error(`beforeInsert (save) Hook Failure ${err}`);
                });
            }
        }

        editedItem = {
            ...safeItem,
            ...editedItem
        }

        // For updates
        let filter: { _id: ObjectId, _owner?: string } | undefined;
        if (safeItem._id && typeof safeItem._id === "string" && onlyOwner) {
            filter = { _id: editedItem._id };
            const currentMemberId = await getOwnerId(enableVisitorId);
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const { upsertedId, acknowledged } = await collection.updateOne(
            filter ? filter : { _id: new ObjectId() },
            { $set: { ...editedItem, _updatedDate: new Date() }, $setOnInsert: !editedItem._createdDate ? { _createdDate: new Date() } : {} },
            { readConcern, upsert: true }
        );

        const returnedItem = { ...editedItem, _id: editedItem._id }

        if (acknowledged) {
            // Hooks handling
            if (upsertedId) {
                // Item Inserted
                const editedResult = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [returnedItem, context]).catch((err) => {
                    throw new Error(`afterInsert Hook Failure ${err}`);
                });

                if (editedResult) {
                    return { item: editedResult, upsertedId };
                } else {
                    return { item: returnedItem, upsertedId };
                }
            } else {
                // Item Updated
                const editedResult = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [returnedItem, context]).catch((err) => {
                    throw new Error(`afterUpdate Hook Failure ${err}`);
                });

                if (editedResult) {
                    return { item: editedResult };
                } else {
                    return { item: returnedItem };
                }
            }
        } else {
            throw new Error(`acknowledged: ${acknowledged}`);
        }
    } catch (err) {
        throw new Error(`WeivData - Error when saving an item to collection: ${err}`);
    }
}