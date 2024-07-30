import { connectionHandler } from '../Helpers/connection_helpers';
import { runDataHook } from '../Hooks/hook_manager';
import { prepareHookContext } from '../Helpers/hook_helpers';
import { CollectionID, Item, WeivDataOptionsOwner } from '@exweiv/weiv-data';
import { validateParams } from '../Helpers/validator';
import { getOwnerId } from '../Helpers/member_id_helpers';
import type { ObjectId } from 'mongodb/mongodb';
import { kaptanLogar } from '../Errors/error_manager';
import { convertDocumentIDs } from '../Helpers/internal_id_converter';
import { convertIdToObjectId } from './id_converters';
import { getConvertIdsValue } from '../Config/weiv_data_config';

export async function replace(collectionId: CollectionID, item: Item, options?: WeivDataOptionsOwner): Promise<Item> {
    try {
        const { safeItem, safeOptions } = await validateParams<'replace'>({ collectionId, item, options }, ["collectionId", "item"], "replace");

        const context = prepareHookContext(collectionId);
        const { suppressAuth, suppressHooks, readConcern, onlyOwner, convertIds } = { convertIds: getConvertIdsValue(), ...safeOptions };

        let editedItem;
        if (suppressHooks != true) {
            editedItem = await runDataHook<'beforeReplace'>(collectionId, "beforeReplace", [safeItem, context]).catch((err) => {
                kaptanLogar("00002", `beforeReplace Hook Failure ${err}`);
            });
        }

        const itemId = !editedItem ? convertIdToObjectId(safeItem._id) : convertIdToObjectId(editedItem._id);
        const replaceItem = !editedItem ? safeItem : editedItem;
        delete replaceItem._id;

        const filter: { _id: ObjectId, _owner?: string } = { _id: itemId };
        if (onlyOwner) {
            const currentMemberId = await getOwnerId();
            if (currentMemberId) {
                filter._owner = currentMemberId;
            }
        }

        const { collection } = await connectionHandler(collectionId, suppressAuth);
        const value = await collection.findOneAndReplace(
            filter,
            { ...replaceItem, _updatedDate: new Date() },
            { readConcern, returnDocument: "after", includeResultMetadata: false }
        );

        if (value) {
            if (suppressHooks != true) {
                let editedResult = await runDataHook<'afterReplace'>(collectionId, "afterReplace", [convertIds ? convertDocumentIDs(value) : value, context]).catch((err) => {
                    kaptanLogar("00003", `afterReplace Hook Failure ${err}`);
                });

                if (editedResult) {
                    return convertIds ? convertDocumentIDs(editedResult) : editedResult;
                }
            }

            return convertIds ? convertDocumentIDs(value) : value;
        } else {
            kaptanLogar("00016", `returned value is null or undefined, the item you want to replace probably doesn't exist.`);
        }
    } catch (err) {
        throw kaptanLogar("00016", `when replacing an item: ${err}`);
    }
}