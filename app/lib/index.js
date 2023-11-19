"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
let counter = 1;
async function testWeivData() {
    const result = await app_1.default
        .query("Tests/PopulationData")
        .skip(0)
        .limit(5)
        .include({ fieldName: "cityId", collectionName: "Cities" })
        .fields("city", "year", "cityId")
        .ge("year", 1999)
        .isNotEmpty("city")
        .ascending("city")
        .find();
    console.log({ result: result.items, hasNext: result.hasNext(), hasPrev: result.hasPrev() });
    return { result, hasNext: result.hasNext(), hasPrev: result.hasPrev() };
}
async function test() {
    const startTime = new Date().getTime();
}
setTimeout(async () => {
    await testWeivData();
}, 1);
