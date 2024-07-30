"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkSave = bulkSave;
const connection_helpers_1 = require("../Helpers/connection_helpers");
const member_id_helpers_1 = require("../Helpers/member_id_helpers");
const hook_manager_1 = require("../Hooks/hook_manager");
const hook_helpers_1 = require("../Helpers/hook_helpers");
const validator_1 = require("../Helpers/validator");
const error_manager_1 = require("../Errors/error_manager");
const internal_id_converter_1 = require("../Helpers/internal_id_converter");
const id_converters_1 = require("./id_converters");
const weiv_data_config_1 = require("../Config/weiv_data_config");
async function bulkSave(collectionId, items, options) {
    try {
        const { safeItems, safeOptions } = await (0, validator_1.validateParams)({ collectionId, items, options }, ["collectionId", "items"], "bulkSave");
        const context = (0, hook_helpers_1.prepareHookContext)(collectionId);
        const { suppressAuth, suppressHooks, enableVisitorId, readConcern, onlyOwner, convertIds } = { convertIds: (0, weiv_data_config_1.getConvertIdsValue)(), ...safeOptions };
        const currentMemberId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        let ownerId = await (0, member_id_helpers_1.getOwnerId)(enableVisitorId);
        let editedItems = safeItems.map(async (item) => {
            if (!item._owner) {
                item._owner = ownerId;
            }
            if (item._id) {
                if (suppressHooks != true) {
                    const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeUpdate", [item, context]).catch((err) => {
                        (0, error_manager_1.kaptanLogar)("00002", `beforeUpdate (bulkSave) Hook Failure ${err}`);
                    });
                    if (editedItem) {
                        return editedItem;
                    }
                    else {
                        return item;
                    }
                }
                else {
                    return item;
                }
            }
            else {
                item._owner = currentMemberId;
                if (suppressHooks != true) {
                    const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "beforeInsert", [item, context]).catch((err) => {
                        (0, error_manager_1.kaptanLogar)("00002", `beforeInsert (bulkSave) Hook Failure ${err}`);
                    });
                    if (editedItem) {
                        return editedItem;
                    }
                    else {
                        return item;
                    }
                }
                else {
                    return item;
                }
            }
        });
        editedItems = await Promise.all(editedItems);
        const bulkOperations = editedItems.map((item) => {
            if (item._id) {
                const filter = { _id: (0, id_converters_1.convertIdToObjectId)(item._id) };
                if (onlyOwner) {
                    if (currentMemberId) {
                        filter._owner = currentMemberId;
                    }
                }
                return {
                    updateOne: {
                        filter,
                        update: { $set: { ...item, _updatedDate: new Date() }, $setOnInsert: !item._createdDate ? { _createdDate: new Date() } : {} },
                        upsert: true
                    }
                };
            }
            else {
                return {
                    insertOne: {
                        document: item
                    }
                };
            }
        });
        const { collection } = await (0, connection_helpers_1.connectionHandler)(collectionId, suppressAuth);
        const { insertedCount, modifiedCount, insertedIds, ok } = await collection.bulkWrite(bulkOperations, { readConcern, ordered: true });
        if (ok) {
            if (suppressHooks != true) {
                editedItems = convertIds ? (0, internal_id_converter_1.recursivelyConvertIds)(editedItems) : editedItems;
                editedItems = editedItems.map(async (item) => {
                    if (item._id) {
                        const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterUpdate", [item, context]).catch((err) => {
                            (0, error_manager_1.kaptanLogar)("00003", `afterUpdate (bulkSave) Hook Failure ${err}`);
                        });
                        if (editedItem) {
                            return editedItem;
                        }
                        else {
                            return item;
                        }
                    }
                    else {
                        const editedItem = await (0, hook_manager_1.runDataHook)(collectionId, "afterInsert", [item, context]).catch((err) => {
                            (0, error_manager_1.kaptanLogar)("00003", `afterInsert Hook Failure ${err}`);
                        });
                        if (editedItem) {
                            return editedItem;
                        }
                        else {
                            return item;
                        }
                    }
                });
                editedItems = await Promise.all(editedItems);
            }
            const editedInsertedIds = Object.keys(insertedIds).map((key) => {
                return (0, internal_id_converter_1.convertToStringId)(insertedIds[key]);
            });
            return {
                insertedItemIds: editedInsertedIds,
                inserted: insertedCount,
                updated: modifiedCount,
                savedItems: convertIds ? (0, internal_id_converter_1.recursivelyConvertIds)(editedItems) : editedItems
            };
        }
        else {
            (0, error_manager_1.kaptanLogar)("00016", `one or more saves failed to complete.`);
        }
    }
    catch (err) {
        (0, error_manager_1.kaptanLogar)("00016", `when saving items using bulkSave: ${err}`);
    }
}
