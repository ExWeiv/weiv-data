"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerId = void 0;
const wix_data_1 = __importDefault(require("wix-data"));
async function getOwnerId() {
    const { _owner } = await wix_data_1.default.insert("WeivOwnerID", {});
    return _owner;
}
exports.getOwnerId = getOwnerId;
