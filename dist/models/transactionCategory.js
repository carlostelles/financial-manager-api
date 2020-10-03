"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = void 0;
const ts_mongoose_1 = require("ts-mongoose");
const mongoose_paginate_1 = __importDefault(require("mongoose-paginate"));
const database_1 = __importDefault(require("../database"));
exports.TransactionType = ['COST', 'INCOME'];
const TransactionCategorySchema = ts_mongoose_1.createSchema({
    description: ts_mongoose_1.Type.string({
        required: true,
        uppercase: true,
        unique: true
    }),
    icon: ts_mongoose_1.Type.string(),
    owner: ts_mongoose_1.Type.objectId({
        ref: 'users'
    }),
    type: ts_mongoose_1.Type.string({
        required: true,
        enum: exports.TransactionType
    }),
    createdAt: ts_mongoose_1.Type.date({
        default: Date.now,
    }),
    inactivatedAt: ts_mongoose_1.Type.date()
});
TransactionCategorySchema.plugin(mongoose_paginate_1.default);
const TransactionCategory = database_1.default.model('transaction-categories', TransactionCategorySchema);
exports.default = TransactionCategory;
//# sourceMappingURL=transactionCategory.js.map