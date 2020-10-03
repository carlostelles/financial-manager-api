"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_1 = __importDefault(require("../models/transaction"));
const validations_1 = require("../utils/validations");
const transactionCategory_1 = __importDefault(require("../models/transactionCategory"));
exports.default = {
    async find(req, res) {
        const user = req.user;
        const { page = 1 } = req.query;
        try {
            const transactions = await transaction_1.default.paginate({ owner: user._id }, {
                page,
                limit: 10,
                populate: 'owner'
            });
            return res.send(transactions);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res);
        }
    },
    async findById(req, res) {
        const user = req.user;
        try {
            const transaction = await transaction_1.default.findById(req.params.id);
            if (!transaction || (transaction && transaction.owner.toString() !== user._id)) {
                return res.status(404).send({ msg: 'Transaction not found' });
            }
            return res.send(transaction);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res);
        }
    },
    async create(req, res) {
        const user = req.user;
        try {
            const transaction = await transaction_1.default.create(Object.assign(Object.assign({}, req.body), { owner: user._id }));
            return res.status(201).send(transaction);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'Transaction registration failed');
        }
    },
    async update(req, res) {
        const { id } = req.params;
        const data = req.body;
        const user = req.user;
        try {
            if (data.category && !await transactionCategory_1.default.findById(data.category)) {
                return res.status(422).send({ msg: 'Transaction category not found' });
            }
            const transaction = await transaction_1.default.findById(id);
            if (!transaction || (transaction && transaction.owner.toString() !== user._id)) {
                return res.status(404).send({ msg: 'Transaction not found' });
            }
            transaction.date = data.date ? data.date : transaction.date;
            transaction.type = data.type ? data.type : transaction.type;
            transaction.value = data.value ? data.value : transaction.value;
            transaction.description = data.description ? data.description : transaction.description;
            transaction.category = data.category ? data.category : transaction.category;
            transaction.tags = data.tags ? data.tags : transaction.tags;
            await transaction.save();
            return res.send(transaction);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'Transaction updated failed');
        }
    },
    async remove(req, res) {
        const user = req.user;
        try {
            const transaction = await transaction_1.default.findById(req.params.id);
            if (!transaction || (transaction && transaction.owner.toString() !== user._id)) {
                return res.status(404).send({ msg: 'Transaction not found' });
            }
            transaction.remove();
            return res.send();
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'Transaction remove failed');
        }
    }
};
//# sourceMappingURL=transactionController.js.map