const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

class PaymentController {
  /**
   * Get all supported banks and their codes
   */
  async getBankCodes(req, res) {
    try {
      logger.info('Fetching bank codes...');
      
      const bankCodes = await paymentService.getBankCode();
      
      logger.info(`Successfully retrieved ${bankCodes.length} bank codes`);
      
      res.json({
        success: true,
        message: 'Bank codes retrieved successfully',
        data: bankCodes,
        count: bankCodes.length
      });
    } catch (error) {
      logger.error('Error getting bank codes:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve bank codes',
        error: error.message
      });
    }
  }

  /**
   * Get specific bank by code
   */
  async getBankByCode(req, res) {
    try {
      const { bankCode } = req.params;
      
      if (!bankCode) {
        return res.status(400).json({
          success: false,
          message: 'Bank code is required'
        });
      }

      logger.info(`Fetching bank details for code: ${bankCode}`);
      
      const allBanks = await paymentService.getBankCode();
      const bank = allBanks.find(bank => bank.code === bankCode);
      
      if (!bank) {
        return res.status(404).json({
          success: false,
          message: `Bank with code '${bankCode}' not found`
        });
      }
      
      res.json({
        success: true,
        message: 'Bank details retrieved successfully',
        data: bank
      });
    } catch (error) {
      logger.error('Error getting bank by code:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve bank details',
        error: error.message
      });
    }
  }

  /**
   * Search banks by name
   */
  async searchBanks(req, res) {
    try {
      const { name } = req.query;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search name parameter is required'
        });
      }

      logger.info(`Searching banks with name: ${name}`);
      
      const allBanks = await paymentService.getBankCode();
      const searchTerm = name.toLowerCase().trim();
      
      const matchingBanks = allBanks.filter(bank => 
        bank.name.toLowerCase().includes(searchTerm)
      );
      
      res.json({
        success: true,
        message: `Found ${matchingBanks.length} banks matching '${name}'`,
        data: matchingBanks,
        count: matchingBanks.length
      });
    } catch (error) {
      logger.error('Error searching banks:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to search banks',
        error: error.message
      });
    }
  }

  /**
   * Validate configuration
   */
  async getPaymentConfig(req, res) {
    try {
      const config = paymentService.validateConfig();
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error getting payment config:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment configuration',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController();