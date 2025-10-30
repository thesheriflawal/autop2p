const merchantService = require("../services/merchantService");
const { DepositService } = require("../services/depositService");
const logger = require("../utils/logger");

class MerchantController {
  /**
   * Create a new merchant
   */
  async createMerchant(req, res) {
    try {
      const merchantData = req.body;

      // Validate required fields
      if (
        !merchantData.walletAddress ||
        !merchantData.name ||
        !merchantData.email
      ) {
        return res.status(400).json({
          success: false,
          message: "walletAddress, name, and email are required",
        });
      }

      const merchant = await merchantService.createMerchant(merchantData);

      res.status(201).json({
        success: true,
        message: "Merchant created successfully",
        data: merchant,
      });
    } catch (error) {
      logger.error("Error creating merchant:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get merchant by wallet address
   */
  async getMerchant(req, res) {
    try {
      const { walletAddress } = req.params;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: "Wallet address is required",
        });
      }

      const merchant = await merchantService.getMerchantByAddress(
        walletAddress
      );

      res.json({
        success: true,
        data: merchant,
      });
    } catch (error) {
      logger.error("Error getting merchant:", error);
      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update merchant ad rate
   */
  async updateAdRate(req, res) {
    try {
      const { merchantId } = req.params;
      const { adRate } = req.body;

      if (!merchantId || adRate === undefined) {
        return res.status(400).json({
          success: false,
          message: "merchantId and adRate are required",
        });
      }

      if (typeof adRate !== "number" || adRate <= 0) {
        return res.status(400).json({
          success: false,
          message: "adRate must be a positive number",
        });
      }

      const merchant = await merchantService.updateAdRate(merchantId, adRate);

      res.json({
        success: true,
        message: "Ad rate updated successfully",
        data: merchant,
      });
    } catch (error) {
      logger.error("Error updating ad rate:", error);
      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get merchant statistics
   */
  async getMerchantStats(req, res) {
    try {
      const { merchantId } = req.params;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          message: "merchantId is required",
        });
      }

      const stats = await merchantService.getMerchantStats(merchantId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error("Error getting merchant stats:", error);
      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get merchant transactions
   */
  async getMerchantTransactions(req, res) {
    try {
      const { merchantId } = req.params;
      const { limit, offset, status } = req.query;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          message: "merchantId is required",
        });
      }

      const options = {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        status: status || null,
      };

      const transactions = await DepositService.getMerchantTransactions(
        merchantId,
        options
      );

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            limit: options.limit,
            offset: options.offset,
            total: transactions.length,
          },
        },
      });
    } catch (error) {
      logger.error("Error getting merchant transactions:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get merchant rate
   */
  async getMerchantRate(req, res) {
    try {
      const { walletAddress } = req.params;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: "Wallet address is required",
        });
      }

      const rate = await merchantService.getMerchantRate(walletAddress);

      res.json({
        success: true,
        data: {
          walletAddress,
          adRate: rate,
        },
      });
    } catch (error) {
      logger.error("Error getting merchant rate:", error);
      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all merchants with optional filtering and pagination
   */
  async getAllMerchants(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        currency,
        minRate,
        maxRate,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search,
        hasBalance,
      } = req.query;

      // Validate query parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: "Page must be greater than 0",
        });
      }

      if (limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100",
        });
      }

      // Validate rate parameters if provided
      if (minRate && (isNaN(minRate) || parseFloat(minRate) < 0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid minRate parameter",
        });
      }

      if (maxRate && (isNaN(maxRate) || parseFloat(maxRate) < 0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid maxRate parameter",
        });
      }

      const options = {
        page: pageNum,
        limit: limitNum,
        currency: currency || null,
        minRate: minRate ? parseFloat(minRate) : null,
        maxRate: maxRate ? parseFloat(maxRate) : null,
        sortBy,
        sortOrder,
        search: search || null,
        hasBalance: hasBalance === "true",
      };

      const result = await merchantService.getAllMerchants(options);

      res.json({
        success: true,
        message: "Merchants retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error getting all merchants:", { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update merchant profile details
   */
  async updateMerchantProfile(req, res) {
    try {
      const { merchantId } = req.params;
      const updateData = req.body;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          message: "Merchant ID is required",
        });
      }

      // Check if there's any data to update
      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No update data provided",
        });
      }

      // List of updatable fields for documentation
      const updatableFields = [
        "name",
        "email",
        "adRate",
        "currency",
        "minOrder",
        "maxOrder",
        "paymentMethods",
      ];

      // Check if any provided fields are valid
      const providedFields = Object.keys(updateData);
      const validFields = providedFields.filter((field) =>
        updatableFields.includes(field)
      );

      if (validFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: `No valid fields provided. Updatable fields are: ${updatableFields.join(
            ", "
          )}`,
          providedFields,
          updatableFields,
        });
      }

      const updatedMerchant = await merchantService.updateMerchantProfile(
        merchantId,
        updateData
      );

      res.json({
        success: true,
        message: "Merchant profile updated successfully",
        data: {
          merchant: updatedMerchant,
          updatedFields: validFields,
        },
      });
    } catch (error) {
      logger.error("Error updating merchant profile:", {
        error: error.message,
      });

      // Handle specific error types
      let status = 500;
      if (error.message.includes("not found")) {
        status = 404;
      } else if (
        error.message.includes("must be") ||
        error.message.includes("invalid") ||
        error.message.includes("required") ||
        error.message.includes("already in use")
      ) {
        status = 400;
      }

      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update merchant profile by wallet address
   */
  async updateMerchantProfileByWallet(req, res) {
    try {
      const { walletAddress } = req.params;
      const updateData = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: "Wallet address is required",
        });
      }

      // Check if there's any data to update
      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No update data provided",
        });
      }

      const updatedMerchant =
        await merchantService.updateMerchantProfileByAddress(
          walletAddress,
          updateData
        );

      res.json({
        success: true,
        message: "Merchant profile updated successfully",
        data: {
          merchant: updatedMerchant,
          updatedFields: Object.keys(updateData).filter((field) =>
            [
              "name",
              "email",
              "adRate",
              "currency",
              "minOrder",
              "maxOrder",
              "paymentMethods",
            ].includes(field)
          ),
        },
      });
    } catch (error) {
      logger.error("Error updating merchant profile by wallet:", {
        error: error.message,
      });

      let status = 500;
      if (error.message.includes("not found")) {
        status = 404;
      } else if (
        error.message.includes("must be") ||
        error.message.includes("invalid") ||
        error.message.includes("required") ||
        error.message.includes("already in use")
      ) {
        status = 400;
      }

      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Process merchant withdrawal
   */
  async processWithdrawal(req, res) {
    try {
      const { merchantId } = req.params;
      const { amount, bankName, accountNumber, accountName, bankCode, narration } = req.body;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          message: "Merchant ID is required",
        });
      }

      // Validate required fields
      if (!amount || !bankName || !accountNumber || !accountName || !bankCode) {
        return res.status(400).json({
          success: false,
          message: "Amount, bankName, accountNumber, accountName, and bankCode are required",
        });
      }

      // Validate amount
      const withdrawalAmount = parseFloat(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid positive number",
        });
      }

      const withdrawalDetails = {
        bankName: bankName.trim(),
        accountNumber: accountNumber.toString().trim(),
        accountName: accountName.trim(),
        narration: narration ? narration.trim() : undefined,
        bankCode: bankCode.trim(),
        
      };

      const result = await merchantService.processWithdrawal(
        merchantId,
        withdrawalAmount,
        withdrawalDetails
      );

      res.status(201).json({
        success: result.success,
        message: result.message,
        data: result.data
      });

    } catch (error) {
      logger.error("Error processing withdrawal:", {
        error: error.message,
        merchantId: req.params.merchantId
      });

      let status = 500;
      if (error.message.includes("not found")) {
        status = 404;
      } else if (
        error.message.includes("Invalid") ||
        error.message.includes("Insufficient") ||
        error.message.includes("Minimum") ||
        error.message.includes("required")
      ) {
        status = 400;
      }

      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Check withdrawal eligibility
   */
  async checkWithdrawalEligibility(req, res) {
    try {
      const { merchantId } = req.params;
      const { amount } = req.query;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          message: "Merchant ID is required",
        });
      }

      if (!amount) {
        return res.status(400).json({
          success: false,
          message: "Amount is required",
        });
      }

      const requestedAmount = parseFloat(amount);
      if (isNaN(requestedAmount) || requestedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid positive number",
        });
      }

      const eligibilityCheck = await merchantService.checkWithdrawalEligibility(
        merchantId,
        requestedAmount
      );

      res.json({
        success: true,
        message: "Withdrawal eligibility checked",
        data: eligibilityCheck
      });

    } catch (error) {
      logger.error("Error checking withdrawal eligibility:", {
        error: error.message,
        merchantId: req.params.merchantId
      });

      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get withdrawal by ID
   */
  async getWithdrawalById(req, res) {
    try {
      const { merchantId, withdrawalId } = req.params;

      if (!merchantId || !withdrawalId) {
        return res.status(400).json({
          success: false,
          message: "Merchant ID and Withdrawal ID are required",
        });
      }

      const withdrawal = await merchantService.getWithdrawalById(
        withdrawalId,
        merchantId
      );

      res.json({
        success: true,
        message: "Withdrawal retrieved successfully",
        data: withdrawal
      });

    } catch (error) {
      logger.error("Error getting withdrawal by ID:", {
        error: error.message,
        merchantId: req.params.merchantId,
        withdrawalId: req.params.withdrawalId
      });

      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get merchant withdrawal history
   */
  async getWithdrawalHistory(req, res) {
    try {
      const { merchantId } = req.params;
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate
      } = req.query;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          message: "Merchant ID is required",
        });
      }

      // Validate pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: "Page must be greater than 0",
        });
      }

      if (limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 100",
        });
      }

      const options = {
        page: pageNum,
        limit: limitNum,
        status: status || null,
        startDate: startDate || null,
        endDate: endDate || null
      };

      const history = await merchantService.getWithdrawalHistory(
        merchantId,
        options
      );

      res.json({
        success: true,
        message: "Withdrawal history retrieved successfully",
        data: history
      });

    } catch (error) {
      logger.error("Error getting withdrawal history:", {
        error: error.message,
        merchantId: req.params.merchantId
      });

      const status = error.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new MerchantController();
