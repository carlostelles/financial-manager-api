import Transaction from "../models/transaction";
import {IUser} from "../models/user";
import {getErrorJson} from "../utils/validations";
import TransactionCategory from "../models/transactionCategory";

export default {
    async find(req: any, res: any) {
        const user: IUser = req.user;
        const {page = 1} = req.query;

        try {
            const transactions = await Transaction.paginate({owner: user._id}, {
                page,
                limit: 10,
                populate: 'owner'
            });

            return res.send(transactions);
        } catch (e) {
            return getErrorJson(e, res);
        }
    },
    async findById(req: any, res: any) {
        const user: IUser = req.user;

        try {
            const transaction = await Transaction.findById(req.params.id);

            if (!transaction || (transaction && transaction.owner.toString() !== user._id)) {
                return res.status(404).send({msg: 'Transaction not found'});
            }

            return res.send(transaction);
        } catch (e) {
            return getErrorJson(e, res);
        }
    },
    async create(req: any, res: any) {
        const user: IUser = req.user;

        try {
            const transaction = await Transaction.create({...req.body, owner: user._id});

            return res.status(201).send(transaction);
        } catch (e) {
            return getErrorJson(e, res, 'Transaction registration failed');
        }

    },
    async update(req: any, res: any) {
        const {id} = req.params;
        const data = req.body;
        const user = req.user;

        try {
            if (data.category && !await TransactionCategory.findById(data.category)) {
                return res.status(422).send({msg: 'Transaction category not found'});
            }

            const transaction = await Transaction.findById(id);

            if (!transaction || (transaction && transaction.owner.toString() !== user._id)) {
                return res.status(404).send({msg: 'Transaction not found'});
            }

            transaction.date = data.date ? data.date : transaction.date;
            transaction.type = data.type ? data.type : transaction.type;
            transaction.value = data.value ? data.value : transaction.value;
            transaction.description = data.description ? data.description : transaction.description;
            transaction.category = data.category ? data.category : transaction.category;
            transaction.tags = data.tags ? data.tags : transaction.tags;
            await transaction.save();

            return res.send(transaction);
        } catch (e) {
            return getErrorJson(e, res, 'Transaction updated failed');
        }
    },
    async remove(req: any, res: any) {
        const user = req.user;

        try {
            const transaction = await Transaction.findById(req.params.id);

            if (!transaction || (transaction && transaction.owner.toString() !== user._id)) {
                return res.status(404).send({msg: 'Transaction not found'});
            }

            transaction.remove();

            return res.send();
        } catch (e) {
            return getErrorJson(e, res, 'Transaction remove failed');
        }
    }
};
