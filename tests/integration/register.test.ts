import supertest = require("supertest");
import * as faker from "faker";
import crypto from "crypto";

import factory from "../factory";
import {dropAllCollections, removeAllCollections} from "../test-setup";
import app from "../../src/app";
import User, {IUser} from "../../src/models/user";

describe('Register', () => {
    afterEach(async () => {
        await removeAllCollections();
    });

    afterAll(async () => {
        await dropAllCollections();
    });

    it('should register valid user', async () => {
        const response = await supertest(app)
            .post('/api/v1/register')
            .send({
                name: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.internet.password(8)
            });

        expect(response.status).toBe(200);
    });

    it('should not register user with invalid password', async () => {
        const response = await supertest(app)
            .post('/api/v1/register')
            .send({
                name: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.internet.password(5)
            });

        expect(response.status).toBe(422);
    });

    it('should not register user with invalid email', async () => {
        const response = await supertest(app)
            .post('/api/v1/register')
            .send({
                name: faker.name.findName(),
                email: "teste@teste",
                password: faker.internet.password(5)
            });

        expect(response.status).toBe(422);
    });

    it('should not register user with invalid email', async () => {
        const response = await supertest(app)
            .post('/api/v1/register')
            .send({
                name: faker.name.findName(),
                email: "teste@teste",
                password: faker.internet.password(5)
            });

        expect(response.status).toBe(422);
    });

    it('should generate accountConfirmToken when register valid user', async () => {
        const response = await supertest(app)
            .post('/api/v1/register')
            .send({
                name: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.internet.password(8)
            });
        const user: IUser = await User.findById(response.body._id).select('+accountConfirmToken');
        expect(user.accountConfirmToken).toBeDefined();
    });

    it('should not register user with email registration', async () => {
        const email = faker.internet.email();
        // @ts-ignore
        const user: IUser = await factory.create('User', {email});
        const response = await supertest(app)
            .post('/api/v1/register')
            .send({
                name: faker.name.findName(),
                email,
                password: faker.internet.password(8)
            });
        expect(response.status).toBe(422);
    });
});

describe('Confirm Account', () => {
    afterEach(async () => {
        await removeAllCollections();
    });

    afterAll(async () => {
        await dropAllCollections();
    });

    it('should confirm account user when valid token', async () => {
        const token = crypto.randomBytes(20).toString('hex');
        // @ts-ignore
        await factory.create('User', {
            accountConfirm: false,
            accountConfirmToken: token
        });
        const response = await supertest(app)
            .post('/api/v1/confirm-account')
            .send({token});
        expect(response.status).toBe(200);
    });

    it('should not confirm account user when without token', async () => {
        const token = crypto.randomBytes(20).toString('hex');
        // @ts-ignore
        await factory.create('User', {
            accountConfirm: false,
            accountConfirmToken: token
        });
        const response = await supertest(app)
            .post('/api/v1/confirm-account');
        expect(response.status).toBe(422);
    });

    it('should not confirm account user when invalid token', async () => {
        const token = crypto.randomBytes(20).toString('hex');
        // @ts-ignore
        await factory.create('User', {
            accountConfirm: false,
            accountConfirmToken: token
        });
        const response = await supertest(app)
            .post('/api/v1/confirm-account')
            .send({token: "8172398217312391823912"});
        expect(response.status).toBe(404);
    });

    it('should not confirm account when confirmation account', async () => {
        const token = crypto.randomBytes(20).toString('hex');
        // @ts-ignore
        await factory.create('User', {
            accountConfirm: true,
            accountConfirmToken: token
        });
        const response = await supertest(app)
            .post('/api/v1/confirm-account')
            .send({token});
        expect(response.status).toBe(422);
    });

    it('should generate JWT token when confirm account user', async () => {
        const token = crypto.randomBytes(20).toString('hex');
        // @ts-ignore
        await factory.create('User', {
            accountConfirm: false,
            accountConfirmToken: token
        });
        const response = await supertest(app)
            .post('/api/v1/confirm-account')
            .send({token});
        expect(response.body).toHaveProperty('token');
    });
});

describe('Forgot Password', () => {
    afterEach(async () => {
        await removeAllCollections();
    });

    afterAll(async () => {
        await dropAllCollections();
    });

    it('should required reset password token when user valid', async () => {
        // @ts-ignore
        const user: IUser = await factory.create('User');
        const response = await supertest(app)
            .post('/api/v1/forgot-password')
            .send({email: user.email});
        expect(response.status).toBe(200);
    });

    it('should required reset password token when user invalid', async () => {
        // @ts-ignore
        const response = await supertest(app)
            .post('/api/v1/forgot-password')
            .send({email: faker.internet.email()});
        expect(response.status).toBe(404);
    });

    it('should generate reset password token for valid user', async () => {
        // @ts-ignore
        const user: IUser = await factory.create('User');
        await supertest(app)
            .post('/api/v1/forgot-password')
            .send({email: user.email});
        const data = await User.findById(user.id).select('+passwordResetToken passwordResetExpires');
        expect(data).toHaveProperty('passwordResetToken');
        expect(data).toHaveProperty('passwordResetExpires');
    });
});

describe('Reset Password', () => {
    afterEach(async () => {
        await removeAllCollections();
    });

    afterAll(async () => {
        await dropAllCollections();
    });

    it('should reset password when valid token', async () => {
        const token = faker.random.hexaDecimal(20);
        const date = new Date();
        date.setHours(date.getHours() + 1);
        await factory.create('User', {
            passwordResetToken: token,
            passwordResetExpires: date
        });
        const response = await supertest(app)
            .post('/api/v1/reset-password')
            .send({token, password: faker.internet.password(6)});
        expect(response.status).toBe(200);
    });

    it('should not reset password when invalid token', async () => {
        const token = faker.random.hexaDecimal(20);
        const date = new Date();
        date.setHours(date.getHours() + 1);
        await factory.create('User', {
            passwordResetToken: token,
            passwordResetExpires: date
        });
        const response = await supertest(app)
            .post('/api/v1/reset-password')
            .send({token: faker.random.hexaDecimal(20), password: faker.internet.password(6)});
        expect(response.status).toBe(400);
    });

    it('should not reset password when expiration token', async () => {
        const token = faker.random.hexaDecimal(20);
        const date = new Date();
        date.setHours(date.getHours() - 1);
        await factory.create('User', {
            passwordResetToken: token,
            passwordResetExpires: date
        });
        const response = await supertest(app)
            .post('/api/v1/reset-password')
            .send({token: token, password: faker.internet.password(6)});
        expect(response.status).toBe(400);
    });

    it('should not reset password when short password', async () => {
        const token = faker.random.hexaDecimal(20);
        const date = new Date();
        date.setHours(date.getHours() + 1);
        await factory.create('User', {
            passwordResetToken: token,
            passwordResetExpires: date
        });
        const response = await supertest(app)
            .post('/api/v1/reset-password')
            .send({token, password: faker.internet.password(5)});
        expect(response.status).toBe(422);
    });

    it('should generated JWT token when reset password', async () => {
        const token = faker.random.hexaDecimal(20);
        const date = new Date();
        date.setHours(date.getHours() + 1);
        await factory.create('User', {
            passwordResetToken: token,
            passwordResetExpires: date
        });
        const response = await supertest(app)
            .post('/api/v1/reset-password')
            .send({token, password: faker.internet.password(6)});
        expect(response.body).toHaveProperty('token');
    });
});

