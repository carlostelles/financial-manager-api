import supertest = require("supertest");
import * as faker from "faker";

import factory from "../factory";
import {dropAllCollections, removeAllCollections} from "../test-setup";
import app from "../../src/app";
import User, {IUser} from "../../src/models/user";
import {generateToken} from "../../src/controllers/userController";
import bcrypt from "bcrypt";

describe('User', () => {
    describe('User Inactivate', () => {
        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should inactivated when valid user', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .delete(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            expect(response.status).toBe(200);
        });

        it('should not inactivated when invalid user', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .delete(`/api/v1/users/5f6e5f0baae6e314146bd965`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            expect(response.status).toBe(404);
        });

        it('should return inactivated date', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .delete(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            expect(response.body.user).toHaveProperty('inactivatedAt');
        });

        it('should not inactivated when invalid format user id', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .delete(`/api/v1/users/${faker.random.uuid()}`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            expect(response.status).toBe(400);
        });
    });

    describe('User Update', () => {
        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should updated when valid user with same email', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .put(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`)
                .send({
                    name: faker.name.findName(),
                    email: user.email
                });
            expect(response.status).toBe(200);
        });

        it('should updated when valid user with other email', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .put(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`)
                .send({
                    email: faker.internet.email()
                });
            expect(response.status).toBe(200);
        });

        it('should not updated when has other user email', async () => {
            // @ts-ignore
            const user1: IUser = await factory.create('User', {email: faker.internet.email()});
            const user2: IUser = await factory.create('User');
            const response = await supertest(app)
                .put(`/api/v1/users/${user1.id}`)
                .set('Authorization', `Bearer ${generateToken(user1)}`)
                .send({
                    email: user2.email
                });
            expect(response.status).toBe(422);
        });

        it('should not updated when user invalid', async () => {
            // @ts-ignore
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .put(`/api/v1/users/5f733041d95c7a5ed0d35e00`)
                .set('Authorization', `Bearer ${generateToken(user)}`)
                .send({
                    password: faker.internet.password(10)
                });
            expect(response.status).toBe(404);
        });

        it('should updated when change only password', async () => {
            const user: IUser = await factory.create('User');
            const password = faker.internet.password(10);
            await supertest(app)
                .put(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`)
                .send({password});
            const db_user = await User.findById(user.id).select('+password');
            expect(bcrypt.compare(password, db_user.password)).toBeTruthy();
        });

        it('should not updated when invalid password', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .put(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`)
                .send({
                    password: faker.internet.password(5)
                });
            expect(response.status).toBe(422);
        });

        it('should not updated when invalid email', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .put(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`)
                .send({
                    email: 'teste@teste'
                });
            expect(response.status).toBe(422);
        });
    });

    describe('User Find by ID', () => {
        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should find user when exist', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .get(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            expect(response.status).toBe(200);
        });

        it('should not find user when not exist', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .get(`/api/v1/users/5f7333277cb3835f384b208e`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            expect(response.status).toBe(404);
        });

        it('should not find user that does not exist', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .get(`/api/v1/users/5f7333277cb3835f384b208e`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            expect(response.status).toBe(404);
        });

        it('should find user in database', async () => {
            const user: IUser = await factory.create('User');
            const response = await supertest(app)
                .get(`/api/v1/users/${user.id}`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            const db_user = await User.findById(user.id);
            expect(response.body.email).toBe(db_user.email);
            expect(response.body.name).toBe(db_user.name);
            expect(response.body.createdAt).toBe(db_user.createdAt.toISOString());
        });
    });

    describe('User Find User List', () => {
        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should find users when exist', async () => {
            // @ts-ignore
            const user: IUser = await factory.create('User', {email: faker.internet.email()});
            await factory.create('User', {email: faker.internet.email()});
            await factory.create('User', {email: faker.internet.email()});
            const response = await supertest(app)
                .get(`/api/v1/users`)
                .set('Authorization', `Bearer ${generateToken(user)}`);
            expect(response.status).toBe(200);
            expect(response.body.total).toBe(response.body.docs.length);
        });
    });
});
