import TransactionCategory, {ITransactionCategory} from "../models/transactionCategory";
import {getErrorJson} from "../utils/validations";
import {IUser} from "../models/user";

export default {
    async find(req: any, res: any) {
        const {page = 1} = req.query;

        try {
            // TODO Pensar como consultar somente as categorias sem owner e com owner do próprio usuário logado
            const transactionCategories = await TransactionCategory.paginate({}, {
                page, limit: 10, populate: 'owner'
            });
            return res.send(transactionCategories);
        } catch (e) {
            return getErrorJson(e, res);
        }
    },
    async findById(req: any, res: any) {
        try {
            const transactionCategory = await TransactionCategory.findById(req.params.id).populate('owner');

            if (!transactionCategory) {
                return res.status(404).send({msg: 'Transaction category not found'});
            }

            return res.send(transactionCategory);
        } catch (e) {
            return getErrorJson(e, res);
        }
    },
    async create(req: any, res: any) {
        const {description} = req.body;
        const user: IUser = req.user;

        try {
            if (await TransactionCategory.findOne({description})) {
                return res.status(422).send({msg: 'Transaction category already exists'});
            }

            const transactionCategory = await TransactionCategory.create({
                ...req.body,
                owner: user.profile === 'CLIENT' ? user : undefined
            });

            return res.status(201).send(transactionCategory);
        } catch (e) {
            return getErrorJson(e, res, 'Transaction category registration failed');
        }

    },
    async update(req: any, res: any) {
        const {id} = req.params;
        const user: IUser = req.user;
        const data = req.body;
        try {
            const transactionCategory: ITransactionCategory = await TransactionCategory.findById(id);

            if (!transactionCategory || (user.profile === 'CLIENT' && transactionCategory && transactionCategory.owner?.toString() !== user._id)) {
                return res.status(404).send({msg: 'Transaction category not found'});
            }

            transactionCategory.description = data.description ? data.description : transactionCategory.description;
            transactionCategory.type = data.type ? data.type : transactionCategory.type;
            transactionCategory.icon = data.icon ? data.icon : transactionCategory.icon;
            await transactionCategory.save();

            return res.send(transactionCategory);
        } catch (e) {
            return getErrorJson(e, res, 'Transaction category updated failed');
        }
    },
    async inactivate(req: any, res: any) {
        const user = req.user;
        try {
            const transactionCategory = await TransactionCategory.findById(req.params.id);

            if (!transactionCategory || (user.profile === 'CLIENT' && transactionCategory && transactionCategory.owner?.toString() !== user._id)) {
                return res.status(404).send({msg: 'Transaction category not found'});
            }

            transactionCategory.inactivatedAt = new Date();
            await transactionCategory.save();

            return res.send(transactionCategory);
        } catch (e) {
            return getErrorJson(e, res, 'Transaction category inactivated failed');
        }

    }
};
