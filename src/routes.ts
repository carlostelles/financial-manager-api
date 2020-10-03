import express from "express";

import authMiddleware from "./middlewares/auth";
import UserController from "./controllers/userController";
import TransactionCategoryController from "./controllers/transactionCategoryController";
import TransactionController from "./controllers/transactionController";

const router = express.Router();
// Auth Routes
router.post('/register', UserController.register);
router.post('/auth', UserController.auth);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/confirm-account', UserController.accountConfirm);

router.use(authMiddleware);

// User Routes
router.get('/users/:id', UserController.findById);
router.put('/users/:id', UserController.update);
router.delete('/users/:id', UserController.inactivate);
router.get('/users', UserController.find);

// User Transaction Category
router.get('/transaction-category/:id', TransactionCategoryController.findById);
router.put('/transaction-category/:id', TransactionCategoryController.update);
router.delete('/transaction-category/:id', TransactionCategoryController.inactivate);
router.get('/transaction-category', TransactionCategoryController.find);
router.post('/transaction-category', TransactionCategoryController.create);

// User Transaction
router.get('/transaction', TransactionController.find);
router.post('/transaction', TransactionController.create);
router.get('/transaction/:id', TransactionController.findById);
router.put('/transaction/:id', TransactionController.update);
router.delete('/transaction/:id', TransactionController.remove);

export default router;
