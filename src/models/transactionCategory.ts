import {createSchema, Type} from 'ts-mongoose';
import mongoosePaginate from "mongoose-paginate";

import mongoose from "../database";

export type TransactionType = 'COST' | 'INCOME';
export const TransactionType = ['COST', 'INCOME'];

export interface ITransactionCategory extends mongoose.Document {
    description: string;
    icon: string;
    owner: string;
    type: TransactionType;
    createdAt: Date;
    inactivatedAt: Date;
}

const TransactionCategorySchema = createSchema({
    description: Type.string({
        required: true,
        uppercase: true,
        unique: true
    }),
    icon: Type.string(),
    owner: Type.objectId({
        ref: 'users'
    }),
    type: Type.string({
        required: true,
        enum: TransactionType
    }),
    createdAt: Type.date({
        default: Date.now,
    }),
    inactivatedAt: Type.date()
});

TransactionCategorySchema.plugin(mongoosePaginate);

const TransactionCategory = mongoose.model<ITransactionCategory>('transaction-categories', TransactionCategorySchema);

export default TransactionCategory;
