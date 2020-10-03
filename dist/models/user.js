"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
const ts_mongoose_1 = require("ts-mongoose");
const mongoose_paginate_1 = __importDefault(require("mongoose-paginate"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../database"));
exports.UserProfile = ['ADMIN', 'CLIENT'];
const UserSchema = ts_mongoose_1.createSchema({
    name: ts_mongoose_1.Type.string({
        required: true
    }),
    email: ts_mongoose_1.Type.string({
        required: true,
        unique: true,
        lowercase: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Email invalid"]
    }),
    password: ts_mongoose_1.Type.string({
        required: true,
        select: false,
        minlength: [6, "Password must be at least 6 characters"]
    }),
    passwordResetToken: ts_mongoose_1.Type.string({
        select: false
    }),
    passwordResetExpires: ts_mongoose_1.Type.date({
        select: false
    }),
    accountConfirm: ts_mongoose_1.Type.boolean({
        default: false
    }),
    accountConfirmToken: ts_mongoose_1.Type.string({
        select: false
    }),
    createdAt: ts_mongoose_1.Type.date({
        default: Date.now,
    }),
    updatedAt: ts_mongoose_1.Type.date({
        default: Date.now
    }),
    inactivatedAt: ts_mongoose_1.Type.date(),
    lastLogin: ts_mongoose_1.Type.date(),
    profile: ts_mongoose_1.Type.string({
        required: true,
        enum: exports.UserProfile
    })
})
    .pre('save', async function (next) {
    if (this.password && this.isModified("password")) {
        this.password = await bcrypt_1.default.hash(this.password, 10);
    }
    next();
})
    .plugin(mongoose_paginate_1.default);
const User = database_1.default.model('users', UserSchema);
exports.default = User;
//# sourceMappingURL=user.js.map