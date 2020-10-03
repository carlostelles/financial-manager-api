import factory from "factory-girl";
import faker from "faker";
import User from "../src/models/user";
import TransactionCategory from "../src/models/transactionCategory";
import Transaction from "../src/models/transaction";

factory.define('User', User, {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(8),
    accountConfirm: true,
    profile: 'CLIENT'
});

factory.define('UserAdmin', User, {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(8),
    accountConfirm: true,
    profile: 'ADMIN'
});

factory.define('TransactionCategory', TransactionCategory, {
    description: faker.name.title(),
    type: 'COST'
});

factory.define('Transaction', Transaction, {
    description: faker.name.title(),
    type: 'COST',
    value: faker.finance.amount(),
    date: faker.date.recent()
});


export default factory;
