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
import { getConvertIdsValue } from '../Config/weiv_data_config';

export async function save(collectionId: CollectionID, item: Item, options?: WeivDataOptionsWriteOwner): Promise<SaveResult<Item>> {
    try {
        // Validate Params
        const { safeOptions, safeItem } = await validateParams<"save">({ collectionId, item, options }, ["collectionId", "item"], "save");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, enableVisitorId, convertIds } = { convertIds: getConvertIdsValue(), ...safeOptions };

        let actionType: "insert" | "update" = "insert";
        let editedItem;

        if (safeItem._id) {
            // Update
            safeItem._id = convertIdToObjectId(safeItem._id);
            actionType = "update";

            if (suppressHooks != true) {
                editedItem = await runDataHook<'beforeUpdate'>(collectionId, "beforeUpdate", [safeItem, context]).catch((err) => {
                    kaptanLogar("00002", `beforeUpdate (save) Hook Failure ${err}`);
                });
            }
        } else {
            // Insert
            safeItem._owner = await getOwnerId(enableVisitorId);
            actionType = "insert";

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
        const filter: { _id: ObjectId, _owner?: string } = safeItem._id ? { _id: safeItem._id } : { _id: new ObjectId() };
        if (onlyOwner) {
            const currentMemberId = await getOwnerId(enableVisitorId);
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const returnedItem = await collection.findOneAndUpdate(
            filter,
            { $set: { ...editedItem, _updatedDate: new Date() }, $setOnInsert: !editedItem._createdDate ? { _createdDate: new Date() } : {} },
            { readConcern, upsert: true, returnDocument: "after" }
        );

        if (returnedItem) {
            // Hooks handling
            if (actionType === "insert") {
                // Item Inserted
                const editedResult = await runDataHook<'afterInsert'>(collectionId, "afterInsert", [convertIds ? convertDocumentIDs(returnedItem) : returnedItem, context]).catch((err) => {
                    kaptanLogar("00003", `afterInsert Hook Failure ${err}`);
                });

                if (editedResult) {
                    return convertIds ? { item: convertDocumentIDs(editedResult) } : { item: editedResult };
                } else {
                    return convertIds ? { item: convertDocumentIDs(returnedItem) } : { item: returnedItem };
                }
            } else if (actionType === "update") {
                // Item Updated
                const editedResult = await runDataHook<'afterUpdate'>(collectionId, "afterUpdate", [convertIds ? convertDocumentIDs(returnedItem) : returnedItem, context]).catch((err) => {
                    kaptanLogar("00003", `afterUpdate Hook Failure ${err}`);
                });

                if (editedResult) {
                    return convertIds ? { item: convertDocumentIDs(editedResult) } : { item: editedResult };
                } else {
                    return convertIds ? { item: convertDocumentIDs(returnedItem) } : { item: returnedItem };
                }
            } else {
                kaptanLogar("00016", `this error is not expected, try again or create a issue in WeivData GitHub repo`);
            }
        } else {
            kaptanLogar("00016", `couldn't save item, this error is unexpected`);
        }
    } catch (err) {
        kaptanLogar("00016", `when saving an item to collection: ${err}`);
    }
}