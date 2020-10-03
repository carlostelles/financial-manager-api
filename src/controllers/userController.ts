import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import path from "path";

import authConfig from "../config/auth.json";
import {sendEmail} from "../modules/mailer";
import User, {IUser} from "../models/user";
import {getErrorJson} from "../utils/validations";

export function generateToken(param: IUser) {
    return jwt.sign({param}, authConfig.secret, {expiresIn: 86400});
}

async function mailConfirmAccount(user: IUser, token: string, res: any) {
    await sendEmail(
        path.join(__dirname, '../resources/mail/auth/confirm-account.html'),
        {token},
        user.email,
        'Confirmação de Email - Financial Manager'
    );
}

export default {
    async find(req: any, res: any) {
        const {page = 1} = req.query;

        try {
            const users = await User.paginate({}, {page, limit: 10});
            return res.send(users);
        } catch (e) {
            return getErrorJson(e, res);
        }
    },
    async findById(req: any, res: any) {
        const user = await User.findById(req.params.id);

        try {
            if (!user) {
                return res.status(404).send({msg: 'User not found'});
            }

            return res.send(user);
        } catch (e) {
            return getErrorJson(e, res);
        }
    },
    async register(req: any, res: any) {
        const {email} = req.body;

        try {
            if (await User.findOne({email})) {
                return res.status(422).send({msg: 'User already exists'});
            }

            const token = crypto.randomBytes(20).toString('hex');
            const user = await User.create({
                ...req.body,
                accountConfirmToken: token,
                profile: 'CLIENT'
            });
            user.accountConfirmToken = undefined;
            user.password = undefined;

            await mailConfirmAccount(user, token, res);

            return res.send(user);
        } catch (e) {
            return getErrorJson(e, res, 'User registration failed');
        }

    },
    async auth(req: any, res: any) {
        const {email, password} = req.body;

        try {
            const user = await User.findOne({email, inactivatedAt: undefined}).select('+password');

            if (!user || !await bcrypt.compare(password, user.password)) {
                return res.status(401).send({msg: 'Incorrect email or password'});
            }

            if (!user.accountConfirm) {
                return res.status(401).send({msg: 'Account not confirmed. Please, verified your email'});
            }

            const updateUser = await User.findByIdAndUpdate(user.id, {
                "$set": {
                    lastLogin: new Date()
                }
            }, {new: true});

            return res.send({user: updateUser, token: generateToken(updateUser)});
        } catch (e) {
            return getErrorJson(e, res, 'User authentication failed');
        }

    },
    update: async function (req: any, res: any) {
        const {id} = req.params;
        const data = req.body;
        const changeEmail = (user: IUser) => data.email && data.email !== user.email;
        let token;

        try {
            const user = await User.findById(id)
                .select('name email password accountConfirm accountConfirmToken');

            if (!user) {
                return res.status(404).send({msg: 'User not found'});
            }

            if (changeEmail(user)) {
                if (await User.findOne({email: data.email})) {
                    return res.status(422).send({msg: 'User already exists'});
                }
                token = crypto.randomBytes(20).toString('hex');
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

            return res.send({user});
        } catch (e) {
            return getErrorJson(e, res, 'User updated failed');
        }
    },
    async inactivate(req: any, res: any) {
        try {
            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).send({msg: 'User not found'});
            }

            user.inactivatedAt = new Date();
            await user.save();

            return res.send({user});
        } catch (e) {
            return getErrorJson(e, res, 'User inactivated failed');
        }

    },
    async accountConfirm(req: any, res: any) {
        const {token} = req.body;
        try {
            if (!token) {
                return res.status(422).send({msg: 'Invalid token'});
            }

            const user = await User.findOne({accountConfirmToken: token});

            if (!user) {
                return res.status(404).send({msg: 'User not found'});
            }

            if (user.accountConfirm) {
                return res.status(422).send({msg: 'User has already been confirmed'});
            }

            const updateUser = await User.findByIdAndUpdate(user.id, {
                "$set": {
                    accountConfirm: true,
                    lastLogin: new Date(),
                    updatedAt: new Date()
                }
            }, {new: true});

            return res.send({user: updateUser, token: generateToken(updateUser)});
        } catch (e) {
            return getErrorJson(e, res, 'User account confirm failed');
        }
    },
    async forgotPassword(req: any, res: any) {
        const {email} = req.body;

        try {
            const user = await User.findOne({email});

            if (!user) {
                return res.status(404).send({msg: 'User not found'});
            }

            const token = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);

            user.passwordResetToken = token;
            user.passwordResetExpires = now;

            await User.findByIdAndUpdate(user.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now
                }
            });

            await sendEmail(
                path.join(__dirname, '../resources/mail/auth/forgot-password.html'),
                {token},
                user.email,
                'Recuperação de Senha - Financial Manager'
            );

            return res.send();
        } catch (e) {
            return getErrorJson(e, res, 'Error on forgot password, try again');
        }
    },
    async resetPassword(req: any, res: any) {
        const {token, password} = req.body;
        const now = new Date();

        try {
            const user = await User.findOne({passwordResetToken: token})
                .select('+passwordResetToken passwordResetExpires');

            if (!user) {
                return res.status(400).send({msg: 'Token invalid'});
            }

            if (user && now > user.passwordResetExpires) {
                return res.status(400).send({msg: 'Token expired, generate a new one'});
            }

            user.password = password;
            user.lastLogin = new Date();
            await user.save();
            user.password = undefined;

            return res.send({user, token: generateToken(user)});
        } catch (e) {
            return getErrorJson(e, res, 'Cannot reset password, try again');
        }
    }
};
