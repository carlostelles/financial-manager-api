import supertest = require("supertest");
import * as faker from "faker";

import factory from "../factory";
import {dropAllCollections, removeAllCollections} from "../test-setup";
import app from "../../src/app";
import TransactionCategory, {ITransactionCategory} from "../../src/models/transactionCategory";
import {getTokenAdmin, getTokenClient} from "../utils";
import User, {IUser} from "../../src/models/user";
import {generateToken} from "../../src/controllers/userController";

describe('Transaction Category', () => {
    describe('Transaction Category Create', () => {

        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should create valid transaction category by user client', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .post('/api/v1/transaction-category')
                .set('Authorization', token.token)
                .send({
                    type: 'COST',
                    description: faker.name.title()
                });

            expect(response.status).toBe(201);
        });

        it('should create valid transaction category by user admin', async () => {
            const token = await getTokenAdmin();
            const response = await supertest(app)
                .post('/api/v1/transaction-category')
                .set('Authorization', token.token)
                .send({
                    type: 'COST',
                    description: faker.name.title()
                });

            expect(response.status).toBe(201);
        });

        it('should not create without type valid', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .post('/api/v1/transaction-category')
                .set('Authorization', token.token)
                .send({
                    type: 'TEST',
                    description: faker.name.title()
                });

            expect(response.status).toBe(422);
        });

        it('should not create without description', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .post('/api/v1/transaction-category')
                .set('Authorization', token.token)
                .send({
                    type: 'COST'
                });

            expect(response.status).toBe(422);
        });

        it('should not create with existing description', async () => {
            const token = await getTokenClient();
            const category: ITransactionCategory = await factory.create('TransactionCategory');
            const response = await supertest(app)
                .post('/api/v1/transaction-category')
                .set('Authorization', token.token)
                .send({
                    type: 'COST',
                    description: category.description
                });
            expect(response.status).toBe(422);
        });

    });

    describe('Transaction Category Update', () => {

        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should update with valid type', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const category: ITransactionCategory = await factory.create('TransactionCategory', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction-category/${category.id}`)
                .set('Authorization', token.token)
                .send({
                    type: 'INCOME'
                });
            expect(response.status).toBe(200);
        });

        it('should update with valid description', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const category: ITransactionCategory = await factory.create('TransactionCategory', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction-category/${category.id}`)
                .set('Authorization', token.token)
                .send({
                    description: faker.name.title()
                });
            expect(response.status).toBe(200);
        });

        it('should update with valid icon', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const category: ITransactionCategory = await factory.create('TransactionCategory', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction-category/${category.id}`)
                .set('Authorization', token.token)
                .send({
                    icon: faker.name.jobType()
                });
            expect(response.status).toBe(200);
        });

        it('should not update with existing category', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const response = await supertest(app)
                .put(`/api/v1/transaction-category/5f7391cb45e3475a00e84b00`)
                .set('Authorization', token.token)
                .send({
                    type: 'INCOME'
                });
            expect(response.status).toBe(404);
        });

        it('should not update with invalid type', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const category: ITransactionCategory = await factory.create('TransactionCategory', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction-category/${category.id}`)
                .set('Authorization', token.token)
                .send({
                    type: 'TEST'
                });
            expect(response.status).toBe(422);
        });
    });

    describe('Transaction Category Inactivate', () => {

        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should inactivate with exiting category', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const category: ITransactionCategory = await factory.create('TransactionCategory', {owner: token.user});
            const response = await supertest(app)
                .delete(`/api/v1/transaction-category/${category.id}`)
                .set('Authorization', token.token);
            expect(response.status).toBe(200);
        });

        it('should not inactivate with no exiting category', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .delete(`/api/v1/transaction-category/5f7391cb45e3475a00e84b00`)
                .set('Authorization', token.token);
            expect(response.status).toBe(404);
        });

        it('should not inactivate with user not owner category', async () => {
            const token = await getTokenClient();
            const category: ITransactionCategory = await factory.create('TransactionCategory');
            const response = await supertest(app)
                .delete(`/api/v1/transaction-category/${category.id}`)
                .set('Authorization', token.token);
            expect(response.status).toBe(404);
        });
    });

    describe('Transaction Category Find', () => {

        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should find categories when exist', async () => {
            const token = await getTokenClient();
            await factory.create('TransactionCategory');
            const response = await supertest(app)
                .get(`/api/v1/transaction-category`)
                .set('Authorization', token.token);
            expect(response.status).toBe(200);
            expect(response.body.total).toBe(response.body.docs.length);
        });
    });

    describe('Transaction Category Find by ID', () => {
        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should find category when exist', async () => {
            const token = await getTokenClient();
            const category: ITransactionCategory = await factory.create('TransactionCategory');
            const response = await supertest(app)
                .get(`/api/v1/transaction-category/${category.id}`)
                .set('Authorization', token.token);
            expect(response.status).toBe(200);
        });

        it('should not find category when not exist', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .get(`/api/v1/transaction-category/5f7333277cb3835f384b208e`)
                .set('Authorization', token.token);
            expect(response.status).toBe(404);
        });

        it('should find category in database', async () => {
            const token = await getTokenClient();
            const category: ITransactionCategory = await factory.create('TransactionCategory');
            const response = await supertest(app)
                .get(`/api/v1/transaction-category/${category.id}`)
                .set('Authorization', token.token);
            // @ts-ignore
            const db_category: ITransactionCategory = await TransactionCategory.findById(category.id);
            expect(response.body.description).toBe(db_category.description);
            expect(response.body.type).toBe(db_category.type);
            expect(response.body.icon).toBe(db_category.icon);
            expect(response.body.createdAt).toBe(db_category.createdAt.toISOString());
        });
    });
});
