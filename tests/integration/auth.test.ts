import supertest = require("supertest");
import {dropAllCollections, removeAllCollections} from "../test-setup";
import factory from "../factory";
import app from "../../src/app";
import {IUser} from "../../src/models/user";
import {generateToken} from "../../src/controllers/userController";

describe('Authentication', () => {
    afterEach(async () => {
        await removeAllCollections();
    });

    afterAll(async () => {
        await dropAllCollections();
    });

    it('should authenticate with valid credentials', async () => {
        const password = 'teste123';
        // @ts-ignore
        const user: IUser = await factory.create('User', {password});
        const response = await supertest(app)
            .post('/api/v1/auth')
            .send({
                email: user.email,
                password
            });

        expect(response.status).toBe(200);
    });

    it('should not authenticate with invalid credentials', async () => {
        // @ts-ignore
        const user: IUser = await factory.create('User', {password: 'teste123'});
        const response = await supertest(app)
            .post('/api/v1/auth')
            .send({
                email: user.email,
                password: '123456'
            });

        expect(response.status).toBe(401);
    });

    it('should return jwt token when authenticated', async () => {
        const password = 'teste123';
        // @ts-ignore
        const user: IUser = await factory.create('User', {password});
        const response = await supertest(app)
            .post('/api/v1/auth')
            .send({
                email: user.email,
                password
            });

        expect(response.body).toHaveProperty('token');
    });

    it('should user account no confirmed not authenticate', async () => {
        const password = 'teste123';
        // @ts-ignore
        const user: IUser = await factory.create('User', {
            accountConfirm: false,
            password
        });
        const response = await supertest(app)
            .post('/api/v1/auth')
            .send({
                email: user.email,
                password
            });

        expect(response.status).toBe(401);
    });

    it('should user inactivated not authenticate', async () => {
        const password = 'teste123';
        // @ts-ignore
        const user: IUser = await factory.create('User', {
            inactivatedAt: new Date(),
            password
        });
        const response = await supertest(app)
            .post('/api/v1/auth')
            .send({
                email: user.email,
                password
            });

        expect(response.status).toBe(401);
    });

    it('should not authenticate route', async () => {
        const response = await supertest(app)
            .get('/api/v1/users');
        expect(response.status).toBe(401);
    });

    it('should not authenticate route by invalid authorization', async () => {
        const user: IUser = await factory.create('User');
        const response = await supertest(app)
            .get('/api/v1/users')
            .set('Authorization', generateToken(user));
        expect(response.status).toBe(401);
    });

    it('should not authenticate route by invalid bearer', async () => {
        const user: IUser = await factory.create('User');
        const response = await supertest(app)
            .get('/api/v1/users')
            .set('Authorization', `Any ${generateToken(user)}`);
        expect(response.status).toBe(401);
    });

    it('should not authenticate route by invalid token', async () => {
        const response = await supertest(app)
            .get('/api/v1/users')
            .set('Authorization', 'Bearer 217832783621371263217362837');
        expect(response.status).toBe(401);
    });
});
