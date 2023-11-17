"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
let counter = 1;
async function testWeivData() {
    const result = await app_1.default
        .query("PopulationData", "Tests")
        .eq("city", "New York")
        .include({
        fieldName: "cityId",
        collectionName: "Cities",
        foreignField: "_id",
    })
        .limit(3)
        .find();
    const hasNext = result.hasNext();
    const hasPrev = result.hasPrev();
    const next = await result.next();
    const prev = await result.next();
    return { result, hasNext, hasPrev, next, prev };
}
async function test() {
    const startTime = new Date().getTime();
    const result = await testWeivData();
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    console.log(result.result.items, duration);
    counter++;
    return { duration, result };
}
test();
