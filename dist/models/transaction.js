"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_mongoose_1 = require("ts-mongoose");
const mongoose_paginate_1 = __importDefault(require("mongoose-paginate"));
const transactionCategory_1 = require("./transactionCategory");
const database_1 = __importDefault(require("../database"));
const TransactionSchema = ts_mongoose_1.createSchema({
    date: ts_mongoose_1.Type.date({
        required: true
    }),
    owner: ts_mongoose_1.Type.objectId({
        ref: 'users',
        required: true
    }),
    type: ts_mongoose_1.Type.string({
        required: true,
        enum: transactionCategory_1.TransactionType
    }),
    value: ts_mongoose_1.Type.number({
        required: true
    }),
    description: ts_mongoose_1.Type.string({
        required: true
    }),
    category: ts_mongoose_1.Type.objectId({
        ref: 'transaction-categories'
    }),
    tags: [ts_mongoose_1.Type.string()]
});
TransactionSchema.plugin(mongoose_paginate_1.default);
const Transaction = database_1.default.model('transactions', TransactionSchema);
exports.default = Transaction;
//# sourceMappingURL=transaction.js.map