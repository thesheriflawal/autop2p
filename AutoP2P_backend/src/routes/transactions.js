const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

// Transaction routes
router.get('/:txHash', transactionController.getTransaction);
router.get('/user/:walletAddress', transactionController.getUserTransactions);
router.post('/process', transactionController.processDeposit);

// Event listener management
router.get('/listener/status', transactionController.getEventListenerStatus);
router.post('/listener/start', transactionController.startEventListener);
router.post('/listener/stop', transactionController.stopEventListener);

// Payment service routes
router.get('/payment/:paymentId/status', transactionController.checkPaymentStatus);
router.get('/payment/history', transactionController.getPaymentHistory);
router.get('/payment/config/test', transactionController.testPaymentConfig);

module.exports = router;