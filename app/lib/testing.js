"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const item = {
    _owner: "31",
    name: "1231",
    number: 312312
};
const defaultValues = {
    _owner: "",
    _updatedDate: new Date()
};
console.log((0, lodash_1.merge)(item, defaultValues));
