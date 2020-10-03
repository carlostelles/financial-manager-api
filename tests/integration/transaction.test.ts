import supertest = require("supertest");
import * as faker from "faker";

import factory from "../factory";
import {dropAllCollections, removeAllCollections} from "../test-setup";
import app from "../../src/app";
import TransactionCategory, {ITransactionCategory} from "../../src/models/transactionCategory";
import {getTokenAdmin, getTokenClient} from "../utils";
import User, {IUser} from "../../src/models/user";
import {generateToken} from "../../src/controllers/userController";
import {ITransaction} from "../../src/models/transaction";

describe('Transaction', () => {
    describe('Transaction Create', () => {
        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should create valid transaction by user client', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const category: ITransactionCategory = await factory.create('TransactionCategory', {owner: token.user});
            const response = await supertest(app)
                .post('/api/v1/transaction')
                .set('Authorization', token.token)
                .send({
                    description: faker.name.title(),
                    type: 'COST',
                    value: faker.finance.amount(),
                    date: faker.date.recent(),
                    category: category.id
                });
            expect(response.status).toBe(201);
        });

        it('should not create without type valid', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .post('/api/v1/transaction')
                .set('Authorization', token.token)
                .send({
                    description: faker.name.title(),
                    type: 'TEST',
                    value: faker.finance.amount(),
                    date: faker.date.recent()
                });
            expect(response.status).toBe(422);
        });

        it('should not create without description', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .post('/api/v1/transaction')
                .set('Authorization', token.token)
                .send({
                    type: 'COST',
                    value: faker.finance.amount(),
                    date: faker.date.recent()
                });
            expect(response.status).toBe(422);
        });
    });

    describe('Transaction Update', () => {
        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should update with valid type', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token)
                .send({
                    type: 'INCOME'
                });
            expect(response.status).toBe(200);
        });

        it('should update with valid description', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token)
                .send({
                    description: faker.name.title()
                });
            expect(response.status).toBe(200);
        });

        it('should update with valid value', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token)
                .send({
                    value: faker.finance.amount()
                });
            expect(response.status).toBe(200);
        });

        it('should update with valid category', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const category: ITransactionCategory = await factory.create('TransactionCategory', {owner: token.user});
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token)
                .send({
                    category: category.id
                });
            expect(response.status).toBe(200);
        });

        it('should update with valid tags', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token)
                .send({
                    tags: [faker.random.word()]
                });
            expect(response.status).toBe(200);
        });

        it('should update with valid date', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token)
                .send({
                    date: faker.date.future()
                });
            expect(response.status).toBe(200);
        });

        it('should not update with no existing transaction', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const response = await supertest(app)
                .put(`/api/v1/transaction/5f7391cb45e3475a00e84b00`)
                .set('Authorization', token.token)
                .send({
                    type: 'INCOME'
                });
            expect(response.status).toBe(404);
        });

        it('should not update with invalid type', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token)
                .send({
                    type: 'TEST'
                });
            expect(response.status).toBe(422);
        });

        it('should not update with invalid transaction', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .put(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token)
                .send({
                    category: '5f7391cb45e3475a00e84b00'
                });
            expect(response.status).toBe(422);
        });
    });

    describe('Transaction Delete', () => {

        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should delete with exiting transaction', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .delete(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token);
            expect(response.status).toBe(200);
        });

        it('should not delete with not found transaction', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .delete(`/api/v1/transaction/5f7391cb45e3475a00e84b00`)
                .set('Authorization', token.token);
            expect(response.status).toBe(404);
        });

        it('should not delete with user not owner transaction', async () => {
            const tokenClient = await getTokenClient();
            const tokenAdmin = await getTokenAdmin();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: tokenClient.user});
            const response = await supertest(app)
                .delete(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', tokenAdmin.token);
            expect(response.status).toBe(404);
        });
    });

    describe('Transaction Find', () => {

        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should find transaction when exist', async () => {
            const token = await getTokenClient();
            await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .get(`/api/v1/transaction`)
                .set('Authorization', token.token);
            expect(response.status).toBe(200);
            expect(response.body.total).toBe(response.body.docs.length);
        });
    });

    describe('Transaction Find by ID', () => {
        afterEach(async () => {
            await removeAllCollections();
        });

        afterAll(async () => {
            await dropAllCollections();
        });

        it('should find transaction when exist', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .get(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token);
            expect(response.status).toBe(200);
        });

        it('should not find transaction when not exist', async () => {
            const token = await getTokenClient();
            const response = await supertest(app)
                .get(`/api/v1/transaction/5f7333277cb3835f384b208e`)
                .set('Authorization', token.token);
            expect(response.status).toBe(404);
        });

        it('should find transaction in database', async () => {
            const token = await getTokenClient();
            // @ts-ignore
            const transaction: ITransaction = await factory.create('Transaction', {owner: token.user});
            const response = await supertest(app)
                .get(`/api/v1/transaction/${transaction.id}`)
                .set('Authorization', token.token);
            // @ts-ignore
            expect(response.body.description).toBe(transaction.description);
            expect(response.body.type).toBe(transaction.type);
            expect(response.body.value).toBe(transaction.value);
            expect(response.body.date).toBe(transaction.date.toISOString());
        });
    });
});
