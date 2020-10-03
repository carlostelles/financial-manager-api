import factory from "./factory";
import {generateToken} from "../src/controllers/userController";
import {IUser} from "../src/models/user";

export async function getTokenClient(): Promise<{user: IUser, token: string}> {
    const user: IUser = await factory.create('User');
    return {
        user, token: `Bearer ${generateToken(user)}`
    };
}

export async function getTokenAdmin(): Promise<{user: IUser, token: string}> {
    const user: IUser = await factory.create('UserAdmin');
    return {
        user, token: `Bearer ${generateToken(user)}`
    };
}

