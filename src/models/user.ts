import {createSchema, Type} from 'ts-mongoose';
import {HookNextFunction} from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import bcrypt from "bcrypt";

import mongoose from "../database";

export type UserProfile = 'ADMIN' | 'CLIENT';
export const UserProfile = ['ADMIN', 'CLIENT'];

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    accountConfirm?: boolean;
    accountConfirmToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
    inactivatedAt?: Date;
    lastLogin?: Date;
    profile?: UserProfile
}

const UserSchema = createSchema({
    name: Type.string({
        required: true
    }),
    email: Type.string({
        required: true,
        unique: true,
        lowercase: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Email invalid"]
    }),
    password: Type.string({
        required: true,
        select: false,
        minlength: [6, "Password must be at least 6 characters"]
    }),
    passwordResetToken: Type.string({
        select: false
    }),
    passwordResetExpires: Type.date({
        select: false
    }),
    accountConfirm: Type.boolean({
        default: false
    }),
    accountConfirmToken: Type.string({
        select: false
    }),
    createdAt: Type.date({
        default: Date.now,
    }),
    updatedAt: Type.date({
        default: Date.now
    }),
    inactivatedAt: Type.date(),
    lastLogin: Type.date(),
    profile: Type.string({
        required: true,
        enum: UserProfile
    })
})
    .pre<IUser>('save', async function (this, next: HookNextFunction) {
        if (this.password && this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    })
    .plugin(mongoosePaginate);

const User = mongoose.model<IUser>('users', UserSchema);

export default User;
