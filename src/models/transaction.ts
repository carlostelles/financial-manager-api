import {createSchema, Type} from 'ts-mongoose';
import mongoosePaginate from "mongoose-paginate";

import {TransactionType} from "./transactionCategory";
import mongoose from "../database";

export interface ITransaction extends mongoose.Document {
    date: Date;
    owner: string;
    type: TransactionType;
    value: number;
    description: string;
    category: string;
    tags: string[];
}

const TransactionSchema = createSchema({
    date: Type.date({
        required: true
    }),
    owner: Type.objectId({
        ref: 'users',
        required: true
    }),
    type: Type.string({
        required: true,
        enum: TransactionType
    }),
    value: Type.number({
        required: true
    }),
    description: Type.string({
        required: true
    }),
    category: Type.objectId({
        ref: 'transaction-categories'
    }),
    tags: [Type.string()]
});

TransactionSchema.plugin(mongoosePaginate);

const Transaction = mongoose.model<ITransaction>('transactions', TransactionSchema);

export default Transaction;
