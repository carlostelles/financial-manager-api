import bcrypt from "bcrypt";

import {dropAllCollections, removeAllCollections} from "../test-setup";
import User from "../../src/models/user";

describe('User', () => {
    afterEach(async () => {
        await removeAllCollections();
    });

    afterAll(async () => {
        await dropAllCollections();
    });

    it('should encrypt user password', async () => {
        const user = await User.create({
            name: 'José da Silva',
            email: 'josedasilva@teste.com',
            password: 'teste123',
            profile: 'CLIENT'
        });
        expect(await bcrypt.compare('teste123', user.password)).toBeTruthy();
    });
});
