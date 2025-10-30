const { DepositService } = require('../services/depositService');
const eventListener = require('../services/eventListener');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

class TransactionController {
  /**
   * Get transaction by hash
   */
  async getTransaction(req, res) {
    try {
      const { txHash } = req.params;
      
      if (!txHash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      const transaction = await DepositService.getTransactionByHash(txHash);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
      
    } catch (error) {
      logger.error('Error getting transaction:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(req, res) {
    try {
      const { walletAddress } = req.params;
      const { limit, offset, status } = req.query;
      
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address is required'
        });
      }

      const options = {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        status: status || null
      };

      const transactions = await DepositService.getUserTransactions(walletAddress, options);
      
      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            limit: options.limit,
            offset: options.offset,
            total: transactions.length
          }
        }
      });
      
    } catch (error) {
      logger.error('Error getting user transactions:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get event listener status
   */
  async getEventListenerStatus(req, res) {
    try {
      const status = eventListener.getStatus();
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      logger.error('Error getting event listener status:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Start event listener
   */
  async startEventListener(req, res) {
    try {
      await eventListener.startListening();
      
      res.json({
        success: true,
        message: 'Event listener started successfully'
      });
      
    } catch (error) {
      logger.error('Error starting event listener:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Stop event listener
   */
  async stopEventListener(req, res) {
    try {
      eventListener.stopListening();
      
      res.json({
        success: true,
        message: 'Event listener stopped successfully'
      });
      
    } catch (error) {
      logger.error('Error stopping event listener:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment ID is required'
        });
      }

      const status = await paymentService.checkPaymentStatus(paymentId);
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      logger.error('Error checking payment status:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(req, res) {
    try {
      const { limit, offset, status, startDate, endDate } = req.query;
      
      const filters = {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        status: status || null,
        startDate: startDate || null,
        endDate: endDate || null
      };

      const history = await paymentService.getPaymentHistory(filters);
      
      res.json({
        success: true,
        data: history
      });
      
    } catch (error) {
      logger.error('Error getting payment history:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Test payment service configuration
   */
  async testPaymentConfig(req, res) {
    try {
      const validation = paymentService.validateConfig();
      
      res.json({
        success: true,
        data: validation
      });
      
    } catch (error) {
      logger.error('Error testing payment config:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Manual deposit processing (for testing/debugging)
   */
  async processDeposit(req, res) {
    try {
      const depositData = req.body;
      
      // Validate required fields
      const required = ['txHash', 'fromAddress', 'toAddress', 'amount'];
      const missing = required.filter(field => !depositData[field]);
      
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missing.join(', ')}`
        });
      }

      const result = await DepositService.processDeposit(depositData);
      
      res.json({
        success: true,
        message: 'Deposit processed successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Error processing deposit:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TransactionController();