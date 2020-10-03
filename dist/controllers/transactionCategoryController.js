"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transactionCategory_1 = __importDefault(require("../models/transactionCategory"));
const validations_1 = require("../utils/validations");
exports.default = {
    async find(req, res) {
        const { page = 1 } = req.query;
        try {
            const transactionCategories = await transactionCategory_1.default.paginate({}, {
                page, limit: 10, populate: 'owner'
            });
            return res.send(transactionCategories);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res);
        }
    },
    async findById(req, res) {
        try {
            const transactionCategory = await transactionCategory_1.default.findById(req.params.id).populate('owner');
            if (!transactionCategory) {
                return res.status(404).send({ msg: 'Transaction category not found' });
            }
            return res.send(transactionCategory);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res);
        }
    },
    async create(req, res) {
        const { description } = req.body;
        const user = req.user;
        try {
            if (await transactionCategory_1.default.findOne({ description })) {
                return res.status(422).send({ msg: 'Transaction category already exists' });
            }
            const transactionCategory = await transactionCategory_1.default.create(Object.assign(Object.assign({}, req.body), { owner: user.profile === 'CLIENT' ? user : undefined }));
            return res.status(201).send(transactionCategory);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'Transaction category registration failed');
        }
    },
    async update(req, res) {
        var _a;
        const { id } = req.params;
        const user = req.user;
        const data = req.body;
        try {
            const transactionCategory = await transactionCategory_1.default.findById(id);
            if (!transactionCategory || (user.profile === 'CLIENT' && transactionCategory && ((_a = transactionCategory.owner) === null || _a === void 0 ? void 0 : _a.toString()) !== user._id)) {
                return res.status(404).send({ msg: 'Transaction category not found' });
            }
            transactionCategory.description = data.description ? data.description : transactionCategory.description;
            transactionCategory.type = data.type ? data.type : transactionCategory.type;
            transactionCategory.icon = data.icon ? data.icon : transactionCategory.icon;
            await transactionCategory.save();
            return res.send(transactionCategory);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'Transaction category updated failed');
        }
    },
    async inactivate(req, res) {
        var _a;
        const user = req.user;
        try {
            const transactionCategory = await transactionCategory_1.default.findById(req.params.id);
            if (!transactionCategory || (user.profile === 'CLIENT' && transactionCategory && ((_a = transactionCategory.owner) === null || _a === void 0 ? void 0 : _a.toString()) !== user._id)) {
                return res.status(404).send({ msg: 'Transaction category not found' });
            }
            transactionCategory.inactivatedAt = new Date();
            await transactionCategory.save();
            return res.send(transactionCategory);
        }
        catch (e) {
            return validations_1.getErrorJson(e, res, 'Transaction category inactivated failed');
        }
    }
};
//# sourceMappingURL=transactionCategoryController.js.map