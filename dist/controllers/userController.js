"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const auth_json_1 = __importDefault(require("../config/auth.json"));
const mailer_1 = require("../modules/mailer");
const user_1 = __importDefault(require("../models/user"));
const validations_1 = require("../utils/validations");
function generateToken(param) {
    return jsonwebtoken_1.default.sign({ param }, auth_json_1.default.secret, { expiresIn: 86400 });
}
exports.generateToken = generateToken;
async function mailConfirmAccount(user, token, res) {
    await mailer_1.sendEmail(path_1.default.join(__dirname, '../resources/mail/auth/confirm-account.html'), { token }, user.email, 'Confirmação de Email - Financial Manager');
}
exports.default = {
    async find(req, res) {
        const { page = 1 } = req.query;
        try {
            const users = await user_1.default.paginate({}, { page, limit: 10 });
            return res.send(users);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res);
        }
    },
    async findById(req, res) {
        const user = await user_1.default.findById(req.params.id);
        try {
            if (!user) {
                return res.status(404).send({ msg: 'User not found' });
            }
            return res.send(user);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res);
        }
    },
    async register(req, res) {
        const { email } = req.body;
        try {
            if (await user_1.default.findOne({ email })) {
                return res.status(422).send({ msg: 'User already exists' });
            }
            const token = crypto_1.default.randomBytes(20).toString('hex');
            const user = await user_1.default.create(Object.assign(Object.assign({}, req.body), { accountConfirmToken: token, profile: 'CLIENT' }));
            user.accountConfirmToken = undefined;
            user.password = undefined;
            await mailConfirmAccount(user, token, res);
            return res.send(user);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'User registration failed');
        }
    },
    async auth(req, res) {
        const { email, password } = req.body;
        try {
            const user = await user_1.default.findOne({ email, inactivatedAt: undefined }).select('+password');
            if (!user || !await bcrypt_1.default.compare(password, user.password)) {
                return res.status(401).send({ msg: 'Incorrect email or password' });
            }
            if (!user.accountConfirm) {
                return res.status(401).send({ msg: 'Account not confirmed. Please, verified your email' });
            }
            const updateUser = await user_1.default.findByIdAndUpdate(user.id, {
                "$set": {
                    lastLogin: new Date()
                }
            }, { new: true });
            return res.send({ user: updateUser, token: generateToken(updateUser) });
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'User authentication failed');
        }
    },
    update: async function (req, res) {
        const { id } = req.params;
        const data = req.body;
        const changeEmail = (user) => data.email && data.email !== user.email;
        let token;
        try {
            const user = await user_1.default.findById(id)
                .select('name email password accountConfirm accountConfirmToken');
            if (!user) {
                return res.status(404).send({ msg: 'User not found' });
            }
            if (changeEmail(user)) {
                if (await user_1.default.findOne({ email: data.email })) {
                    return res.status(422).send({ msg: 'User already exists' });
                }
                token = crypto_1.default.randomBytes(20).toString('hex');
            }
            user.name = data.name ? data.name : user.name;
            user.email = data.email ? data.email : user.email;
            user.password = data.password ? data.password : user.password;
            user.updatedAt = new Date();
            user.accountConfirm = token ? false : user.accountConfirm;
            user.accountConfirmToken = token ? token : user.accountConfirmToken;
            await user.save();
            user.password = undefined;
            user.accountConfirmToken = undefined;
            if (token) {
                await mailConfirmAccount(user, token, res);
            }
            return res.send({ user });
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'User updated failed');
        }
    },
    async inactivate(req, res) {
        try {
            const user = await user_1.default.findById(req.params.id);
            if (!user) {
                return res.status(404).send({ msg: 'User not found' });
            }
            user.inactivatedAt = new Date();
            await user.save();
            return res.send({ user });
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'User inactivated failed');
        }
    },
    async accountConfirm(req, res) {
        const { token } = req.body;
        try {
            if (!token) {
                return res.status(422).send({ msg: 'Invalid token' });
            }
            const user = await user_1.default.findOne({ accountConfirmToken: token });
            if (!user) {
                return res.status(404).send({ msg: 'User not found' });
            }
            if (user.accountConfirm) {
                return res.status(422).send({ msg: 'User has already been confirmed' });
            }
            const updateUser = await user_1.default.findByIdAndUpdate(user.id, {
                "$set": {
                    accountConfirm: true,
                    lastLogin: new Date(),
                    updatedAt: new Date()
                }
            }, { new: true });
            return res.send({ user: updateUser, token: generateToken(updateUser) });
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'User account confirm failed');
        }
    },
    async forgotPassword(req, res) {
        const { email } = req.body;
        try {
            const user = await user_1.default.findOne({ email });
            if (!user) {
                return res.status(404).send({ msg: 'User not found' });
            }
            const token = crypto_1.default.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);
            user.passwordResetToken = token;
            user.passwordResetExpires = now;
            await user_1.default.findByIdAndUpdate(user.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now
                }
            });
            await mailer_1.sendEmail(path_1.default.join(__dirname, '../resources/mail/auth/forgot-password.html'), { token }, user.email, 'Recuperação de Senha - Financial Manager');
            return res.send();
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'Error on forgot password, try again');
        }
    },
    async resetPassword(req, res) {
        const { token, password } = req.body;
        const now = new Date();
        try {
            const user = await user_1.default.findOne({ passwordResetToken: token })
                .select('+passwordResetToken passwordResetExpires');
            if (!user) {
                return res.status(400).send({ msg: 'Token invalid' });
            }
            if (user && now > user.passwordResetExpires) {
                return res.status(400).send({ msg: 'Token expired, generate a new one' });
            }
            user.password = password;
            user.lastLogin = new Date();
            await user.save();
            user.password = undefined;
            return res.send({ user, token: generateToken(user) });
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'Cannot reset password, try again');
        }
    }
};
//# sourceMappingURL=userController.js.map