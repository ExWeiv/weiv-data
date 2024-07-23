import type { CollectionID, Item, SaveResult, WeivDataOptionsWriteOwner } from '@exweiv/weiv-data';
import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { ObjectId } from 'mongodb';
import { validateParams } from '../Helpers/validator';
import { getOwnerId } from '../Helpers/member_id_helpers';
import { kaptanLogar } from '../Errors/error_manager';
import { convertDocumentIDs } from '../Helpers/internal_id_converter';
import { convertIdToObjectId } from './id_converters';

export async function save(collectionId: CollectionID, item: Item, options?: WeivDataOptionsWriteOwner): Promise<SaveResult<Item>> {
    try {
        // Validate Params
        const { safeOptions, safeItem } = await validateParams<"save">({ collectionId, item, options }, ["collectionId", "item"], "save");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, enableVisitorId, convertIds } = safeOptions || {};

        // Convert ID to ObjectId if exist
        let editedItem;
        if (safeItem._id) {
            // Update
            safeItem._id = convertIdToObjectId(safeItem._id);

            if (suppressHooks != true) {
                editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                    kaptanLogar("00002", `beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        } else {
            // Insert
            safeItem._owner = await getOwnerId(enableVisitorId);

            if (suppressHooks != true) {
                editedItem = await runDataHook<'beforeInsert'>(collectionId, "beforeInsert", [safeItem, context]).catch((err) => {
                    kaptanLogar("00002", `beforeInsert (save) Hook Failure ${err}`);
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

        const returnedItem = { ...editedItem, _id: editedItem._id };

        if (acknowledged) {
            // Hooks handling
            if (upsertedId) {
                // Item Inserted
                const editedResult = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [convertIds ? convertDocumentIDs(returnedItem) : returnedItem, context]).catch((err) => {
                    kaptanLogar("00003", `afterInsert Hook Failure ${err}`);
                });

                if (editedResult) {
                    return convertIds ? { item: convertDocumentIDs(editedResult) } : { item: editedResult };
                } else {
                    return convertIds ? { item: convertDocumentIDs(returnedItem) } : { item: returnedItem };
                }
            } else {
                // Item Updated
                const editedResult = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [convertIds ? convertDocumentIDs(returnedItem) : returnedItem, context]).catch((err) => {
                    kaptanLogar("00003", `afterUpdate Hook Failure ${err}`);
                });

                if (editedResult) {
                    return convertIds ? { item: convertDocumentIDs(editedResult) } : { item: editedResult };
                } else {
                    return convertIds ? { item: convertDocumentIDs(returnedItem) } : { item: returnedItem };
                }
            }
        } else {
            kaptanLogar("00016", `acknowledged is not true for (save function)`);
        }
    } catch (err) {
        kaptanLogar("00016", `when saving an item to collection: ${err}`);
    }
}