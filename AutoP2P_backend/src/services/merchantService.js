const { Merchant, Transaction, Withdrawal } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const paymentService = require("./paymentService");

class MerchantService {
  /**
   * Get merchant by wallet address
   * @param {string} walletAddress - Merchant's wallet address
   * @returns {Promise<Object>} Merchant object
   */
  async getMerchantByAddress(walletAddress) {
    try {
      const merchant = await Merchant.findOne({
        where: {
          walletAddress: walletAddress.toLowerCase(),
          isActive: true,
        },
      });

      if (!merchant) {
        throw new Error(
          `Merchant not found for wallet address: ${walletAddress}`
        );
      }

      return merchant;
    } catch (error) {
      logger.error("Error getting merchant by address:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get merchant by ID
   * @param {string} merchantId - Merchant's ID
   * @returns {Promise<Object>} Merchant object
   */
  async getMerchantById(merchantId) {
    try {
      const merchant = await Merchant.findOne({
        where: {
          id: merchantId,
          isActive: true,
        },
      });

      if (!merchant) {
        throw new Error(`Merchant not found for id: ${merchantId}`);
      }

      return merchant;
    } catch (error) {
      logger.error("Error getting merchant by id:", { error: error.message });
      throw error;
    }
  }

  /**
   * Get merchant by email address
   * @param {string} email - Merchant's email address
   * @returns {Promise<Object>} Merchant object
   */
  async getMerchantByEmail(email) {
    try {
      const merchant = await Merchant.findOne({
        where: {
          email: email.toLowerCase(),
          isActive: true,
        },
      });

      if (!merchant) {
        throw new Error(`Merchant not found for email: ${email}`);
      }

      return merchant;
    } catch (error) {
      logger.error("Error getting merchant by email:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get merchant's current ad rate
   * @param {string} walletAddress - Merchant's wallet address
   * @returns {Promise<number>} Current ad rate
   */
  async getMerchantRate(walletAddress) {
    try {
      const merchant = await this.getMerchantByAddress(walletAddress);
      return parseFloat(merchant.adRate);
    } catch (error) {
      logger.error("Error getting merchant rate:", { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate the amount to send to user based on merchant's ad rate
   * @param {string} walletAddress - Merchant's wallet address
   * @param {string} depositAmount - Original deposit amount
   * @returns {Promise<Object>} Calculation result
   */
  async calculateAmount(merchantId, depositAmount) {
    try {
      const merchant = await this.getMerchantById(merchantId);
      const rate = parseFloat(merchant.adRate);
      const amount = parseFloat(depositAmount);

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid deposit amount");
      }

      const calculatedAmount = amount * rate;

      // Check if merchant has sufficient balance
      const currentBalance = parseFloat(merchant.balance);
      if (currentBalance < calculatedAmount) {
        throw new Error("Insufficient merchant balance");
      }

      return {
        originalAmount: amount,
        rate: rate,
        calculatedAmount: calculatedAmount,
        merchantBalance: currentBalance,
        merchant: merchant,
      };
    } catch (error) {
      logger.error("Error calculating amount:", { error: error.message });
      throw error;
    }
  }

  /**
   * Update merchant balance (increase or decrease)
   * @param {string} merchantId - Merchant's ID
   * @param {number} amount - Amount to add (positive) or subtract (negative)
   * @param {string} operation - 'add' or 'subtract' for explicit operation type
   * @returns {Promise<Object>} Updated merchant
   */
  async updateBalance(merchantId, amount, operation = "subtract") {
    try {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        throw new Error("Merchant not found");
      }

      const currentBalance = parseFloat(merchant.balance);
      const amountValue = parseFloat(amount);

      if (isNaN(amountValue)) {
        throw new Error("Invalid amount provided");
      }

      let newBalance;
      let operationDescription;

      if (operation === "add") {
        newBalance = currentBalance + Math.abs(amountValue);
        operationDescription = "added";
      } else if (operation === "subtract") {
        const amountToSubtract = Math.abs(amountValue);

        if (currentBalance < amountToSubtract) {
          throw new Error("Insufficient balance for transaction");
        }

        newBalance = currentBalance - amountToSubtract;
        operationDescription = "subtracted";
      } else {
        throw new Error('Invalid operation. Use "add" or "subtract"');
      }

      await merchant.update({
        balance: newBalance,
        updatedAt: new Date(),
      });

      logger.info(`Merchant balance updated:`, {
        merchantId,
        operation,
        previousBalance: currentBalance,
        newBalance: newBalance,
        amount: Math.abs(amountValue),
        description: `Amount ${operationDescription}`,
      });

      return merchant;
    } catch (error) {
      logger.error("Error updating merchant balance:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Process merchant withdrawal
   * @param {string} merchantId - Merchant's ID
   * @param {number} withdrawalAmount - Amount to withdraw
   * @param {Object} withdrawalDetails - Withdrawal details (bank info, etc.)
   * @returns {Promise<Object>} Withdrawal result
   */
  async processWithdrawal(
    merchantId,
    withdrawalAmount,
    withdrawalDetails = {}
  ) {
    try {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        throw new Error("Merchant not found");
      }

      const currentBalance = parseFloat(merchant.balance);
      const amountToWithdraw = parseFloat(withdrawalAmount);

      // Validation checks
      if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
        throw new Error(
          "Invalid withdrawal amount. Amount must be greater than 0"
        );
      }

      if (currentBalance < amountToWithdraw) {
        throw new Error(
          `Insufficient balance. Current balance: ${currentBalance}, Requested: ${amountToWithdraw}`
        );
      }

      // Minimum withdrawal amount check (optional business rule)
      const minWithdrawal = 10; // Minimum withdrawal of 10 units
      if (amountToWithdraw < minWithdrawal) {
        throw new Error(`Minimum withdrawal amount is ${minWithdrawal}`);
      }

      // Validate withdrawal details
      const requiredFields = [
        "bankName",
        "accountNumber",
        "accountName",
        "bankCode",
      ];
      for (const field of requiredFields) {
        console.log(withdrawalDetails);
        console.log(withdrawalDetails[field]);
        if (
          !withdrawalDetails[field] ||
          withdrawalDetails[field].toString().trim() === ""
        ) {
          throw new Error(`${field} is required for withdrawal`);
        }
      }

      // Generate withdrawal reference
      const withdrawalRef = `WD_${merchant.id}_${Date.now()}`;

      const paymentResult = await paymentService.sendFunds({
        amount: amountToWithdraw,
        accountNumber: withdrawalDetails.accountNumber,
        accountName: withdrawalDetails.accountName,
        bankCode: withdrawalDetails.bankCode || "000", // Default bank code if not provided
        merchantTxRef: withdrawalRef,
        senderName: merchant.name,
        narration:
          withdrawalDetails.narration || `Withdrawal by ${merchant.name}`,
      });

      let newBalance;

      // Deduct amount from merchant balance
      if (paymentResult.success) {
        await this.updateBalance(merchant.id, amountToWithdraw);
        newBalance = parseFloat(merchant.balance) - amountToWithdraw;
      }

      // Create withdrawal record in database
      const withdrawalRecord = await Withdrawal.create({
        merchantId: merchant.id,
        amount: amountToWithdraw,
        previousBalance: currentBalance,
        newBalance: newBalance,
        withdrawalRef,
        status: "pending", // pending, processing, completed, failed
        bankName: withdrawalDetails.bankName,
        accountNumber: withdrawalDetails.accountNumber,
        accountName: withdrawalDetails.accountName,
        narration:
          withdrawalDetails.narration || `Withdrawal by ${merchant.name}`,
        currency: merchant.currency || "ETH",
        requestedAt: new Date(),
        metadata: {
          userAgent: withdrawalDetails.userAgent || null,
          ipAddress: withdrawalDetails.ipAddress || null,
          deviceInfo: withdrawalDetails.deviceInfo || null,
        },
      });

      logger.info("Merchant withdrawal processed:", {
        merchantId,
        merchantEmail: merchant.email,
        withdrawalAmount: amountToWithdraw,
        previousBalance: currentBalance,
        newBalance: newBalance,
        withdrawalRef,
        bankDetails: {
          bankName: withdrawalDetails.bankName,
          accountNumber: withdrawalDetails.accountNumber.replace(
            /.(?=.{4})/g,
            "*"
          ), // Mask account number
          accountName: withdrawalDetails.accountName,
        },
      });

      return {
        success: true,
        message: "Withdrawal request processed successfully",
        data: {
          id: withdrawalRecord.id,
          withdrawalRef,
          amount: amountToWithdraw,
          previousBalance: currentBalance,
          newBalance: newBalance,
          status: "pending",
          estimatedProcessingTime: "1-3 business days",
          bankName: withdrawalDetails.bankName,
          accountName: withdrawalDetails.accountName,
          accountNumber: withdrawalDetails.accountNumber.replace(
            /.(?=.{4})/g,
            "*"
          ), // Masked
          requestedAt: withdrawalRecord.requestedAt,
          withdrawalRecord: withdrawalRecord.toJSON(),
        },
      };
    } catch (error) {
      logger.error("Error processing merchant withdrawal:", {
        merchantId,
        withdrawalAmount,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get merchant withdrawal history
   * @param {string} merchantId - Merchant's ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Withdrawal history
   */
  async getWithdrawalHistory(merchantId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,
        startDate = null,
        endDate = null,
      } = options;

      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        throw new Error("Merchant not found");
      }

      const offset = (page - 1) * limit;
      const whereCondition = {
        merchantId: merchantId,
      };

      // Filter by status if provided
      if (status) {
        whereCondition.status = status;
      }

      // Filter by date range if provided
      if (startDate || endDate) {
        whereCondition.requestedAt = {};
        if (startDate) {
          whereCondition.requestedAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereCondition.requestedAt[Op.lte] = new Date(endDate);
        }
      }

      // Get withdrawals with pagination
      const { rows: withdrawals, count: totalItems } =
        await Withdrawal.findAndCountAll({
          where: whereCondition,
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [["requestedAt", "DESC"]],
          include: [
            {
              model: Merchant,
              as: "merchant",
              attributes: ["id", "name", "email"],
            },
          ],
        });

      // Mask account numbers in results
      const maskedWithdrawals = withdrawals.map((withdrawal) => {
        const withdrawalData = withdrawal.toJSON();
        if (withdrawalData.accountNumber) {
          // Show only last 4 digits
          withdrawalData.accountNumber = withdrawalData.accountNumber.replace(
            /.(?=.{4})/g,
            "*"
          );
        }
        return withdrawalData;
      });

      // Calculate summary statistics
      const allWithdrawals = await Withdrawal.findAll({
        where: { merchantId: merchantId },
        attributes: ["amount", "status"],
      });

      const summary = {
        totalWithdrawn: allWithdrawals
          .filter((w) => w.status === "completed")
          .reduce((sum, w) => sum + parseFloat(w.amount), 0),
        pendingWithdrawals: allWithdrawals
          .filter((w) => ["pending", "processing"].includes(w.status))
          .reduce((sum, w) => sum + parseFloat(w.amount), 0),
        completedWithdrawals: allWithdrawals.filter(
          (w) => w.status === "completed"
        ).length,
        totalCount: allWithdrawals.length,
      };

      const totalPages = Math.ceil(totalItems / limit);

      logger.info("Withdrawal history retrieved:", {
        merchantId,
        totalItems,
        page,
        limit,
      });

      return {
        withdrawals: maskedWithdrawals,
        pagination: {
          currentPage: parseInt(page),
          totalItems,
          itemsPerPage: parseInt(limit),
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        summary,
      };
    } catch (error) {
      logger.error("Error getting withdrawal history:", {
        merchantId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get withdrawal by ID
   * @param {string} withdrawalId - Withdrawal ID
   * @param {string} merchantId - Merchant ID (for security)
   * @returns {Promise<Object>} Withdrawal record
   */
  async getWithdrawalById(withdrawalId, merchantId = null) {
    try {
      const whereCondition = {
        id: withdrawalId,
      };

      // If merchantId is provided, ensure the withdrawal belongs to that merchant
      if (merchantId) {
        whereCondition.merchantId = merchantId;
      }

      const withdrawal = await Withdrawal.findOne({
        where: whereCondition,
        include: [
          {
            model: Merchant,
            as: "merchant",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (!withdrawal) {
        throw new Error("Withdrawal not found");
      }

      // Mask account number in response
      const withdrawalData = withdrawal.toJSON();
      if (withdrawalData.accountNumber) {
        withdrawalData.accountNumber = withdrawalData.accountNumber.replace(
          /.(?=.{4})/g,
          "*"
        );
      }

      logger.info("Withdrawal retrieved by ID:", {
        withdrawalId,
        merchantId: withdrawal.merchantId,
        status: withdrawal.status,
      });

      return withdrawalData;
    } catch (error) {
      logger.error("Error getting withdrawal by ID:", {
        withdrawalId,
        merchantId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Check withdrawal eligibility
   * @param {string} merchantId - Merchant's ID
   * @param {number} requestedAmount - Requested withdrawal amount
   * @returns {Promise<Object>} Eligibility check result
   */
  async checkWithdrawalEligibility(merchantId, requestedAmount) {
    try {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        throw new Error("Merchant not found");
      }

      const currentBalance = parseFloat(merchant.balance);
      const amount = parseFloat(requestedAmount);
      const minWithdrawal = 10;

      const eligibilityCheck = {
        eligible: true,
        reasons: [],
        currentBalance,
        requestedAmount: amount,
        minimumWithdrawal: minWithdrawal,
      };

      // Check various eligibility criteria
      if (isNaN(amount) || amount <= 0) {
        eligibilityCheck.eligible = false;
        eligibilityCheck.reasons.push("Invalid withdrawal amount");
      }

      if (amount < minWithdrawal) {
        eligibilityCheck.eligible = false;
        eligibilityCheck.reasons.push(
          `Minimum withdrawal amount is ${minWithdrawal}`
        );
      }

      if (currentBalance < amount) {
        eligibilityCheck.eligible = false;
        eligibilityCheck.reasons.push("Insufficient balance");
      }

      if (!merchant.isActive) {
        eligibilityCheck.eligible = false;
        eligibilityCheck.reasons.push("Merchant account is not active");
      }

      // Add more business rules as needed
      // e.g., daily withdrawal limits, pending withdrawal limits, etc.

      return eligibilityCheck;
    } catch (error) {
      logger.error("Error checking withdrawal eligibility:", {
        merchantId,
        requestedAmount,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a new merchant
   * @param {Object} merchantData - Merchant data
   * @returns {Promise<Object>} Created merchant
   */
  async createMerchant(merchantData) {
    try {
      const merchant = await Merchant.create({
        ...merchantData,
        walletAddress: merchantData.walletAddress.toLowerCase(),
      });

      logger.info("New merchant created:", { merchantId: merchant.id });
      return merchant;
    } catch (error) {
      logger.error("Error creating merchant:", { error: error.message });
      throw error;
    }
  }

  /**
   * Update merchant ad rate
   * @param {string} merchantId - Merchant's ID
   * @param {number} newRate - New ad rate
   * @returns {Promise<Object>} Updated merchant
   */
  async updateAdRate(merchantId, newRate) {
    try {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        throw new Error("Merchant not found");
      }

      if (newRate <= 0) {
        throw new Error("Ad rate must be greater than 0");
      }

      await merchant.update({
        adRate: newRate,
        updatedAt: new Date(),
      });

      logger.info(`Merchant ad rate updated:`, {
        merchantId,
        newRate,
      });

      return merchant;
    } catch (error) {
      logger.error("Error updating merchant ad rate:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get merchant statistics
   * @param {string} merchantId - Merchant's ID
   * @returns {Promise<Object>} Merchant statistics
   */
  async getMerchantStats(merchantId) {
    try {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        throw new Error("Merchant not found");
      }

      const transactions = await Transaction.findAll({
        where: { merchantId },
        order: [["createdAt", "DESC"]],
        limit: 100,
      });

      const totalTransactions = transactions.length;
      const totalVolume = transactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount),
        0
      );
      const totalCalculatedVolume = transactions.reduce(
        (sum, tx) => sum + parseFloat(tx.calculatedAmount),
        0
      );

      return {
        merchant,
        stats: {
          totalTransactions,
          totalVolume,
          totalCalculatedVolume,
          averageRate:
            totalVolume > 0 ? totalCalculatedVolume / totalVolume : 0,
          currentBalance: parseFloat(merchant.balance),
        },
      };
    } catch (error) {
      logger.error("Error getting merchant stats:", { error: error.message });
      throw error;
    }
  }

  /**
   * Get all active merchants with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Merchants list with pagination info
   */
  async getAllMerchants(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        currency = null,
        minRate = null,
        maxRate = null,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search = null,
        hasBalance = false,
      } = options;

      const offset = (page - 1) * limit;
      const whereCondition = {
        isActive: true,
      };

      // Filter by currency if specified
      if (currency) {
        whereCondition.currency = currency;
      }

      // Filter by ad rate range if specified
      if (minRate !== null || maxRate !== null) {
        whereCondition.adRate = {};
        if (minRate !== null) whereCondition.adRate[Op.gte] = minRate;
        if (maxRate !== null) whereCondition.adRate[Op.lte] = maxRate;
      }

      // Filter merchants with balance if specified
      if (hasBalance) {
        whereCondition.balance = {
          [Op.gt]: 0,
        };
      }

      // Search by name or email if specified
      if (search) {
        whereCondition[Op.or] = [
          {
            name: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            email: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ];
      }

      // Validate sort field
      const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "name",
        "adRate",
        "balance",
      ];
      const validSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";
      const validSortOrder = ["ASC", "DESC"].includes(sortOrder.toUpperCase())
        ? sortOrder.toUpperCase()
        : "DESC";

      const { rows: merchants, count: total } = await Merchant.findAndCountAll({
        where: whereCondition,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[validSortBy, validSortOrder]],
        attributes: {
          exclude: ["email"], // Don't expose emails in public listing
        },
      });

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        merchants,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPreviousPage,
          nextPage: hasNextPage ? parseInt(page) + 1 : null,
          previousPage: hasPreviousPage ? parseInt(page) - 1 : null,
        },
      };
    } catch (error) {
      logger.error("Error getting all merchants:", { error: error.message });
      throw error;
    }
  }

  /**
   * Update merchant profile details
   * @param {string} merchantId - Merchant's ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated merchant
   */
  async updateMerchantProfile(merchantId, updateData) {
    try {
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        throw new Error("Merchant not found");
      }

      // Define which fields can be updated by merchants themselves
      const allowedFields = [
        "name",
        "email",
        "adRate",
        "currency",
        "minOrder",
        "maxOrder",
        "isActive",
        "paymentMethods",
        "walletAddress",
      ];

      // Filter out any fields that aren't allowed to be updated
      const filteredData = {};
      for (const field of allowedFields) {
        if (updateData.hasOwnProperty(field)) {
          filteredData[field] = updateData[field];
        }
      }

      // Additional validation for specific fields
      if (filteredData.email && filteredData.email !== merchant.email) {
        // Check if email is already taken by another merchant
        const existingMerchant = await Merchant.findOne({
          where: {
            email: filteredData.email.toLowerCase(),
            id: { [Op.ne]: merchantId },
          },
        });

        if (existingMerchant) {
          throw new Error(
            "Email address is already in use by another merchant"
          );
        }

        filteredData.email = filteredData.email.toLowerCase();
      }

      // Validate adRate
      if (filteredData.adRate !== undefined) {
        const rate = parseFloat(filteredData.adRate);
        if (isNaN(rate) || rate <= 0 || rate > 10) {
          throw new Error("Ad rate must be a positive number between 0 and 10");
        }
        filteredData.adRate = rate;
      }

      // Validate order amounts
      if (filteredData.minOrder !== undefined) {
        const minOrder = parseFloat(filteredData.minOrder);
        if (isNaN(minOrder) || minOrder < 0) {
          throw new Error("Minimum order amount must be a non-negative number");
        }
        filteredData.minOrder = minOrder;
      }

      if (filteredData.maxOrder !== undefined) {
        const maxOrder = parseFloat(filteredData.maxOrder);
        if (isNaN(maxOrder) || maxOrder < 0) {
          throw new Error("Maximum order amount must be a non-negative number");
        }
        filteredData.maxOrder = maxOrder;
      }

      // Validate min/max order relationship
      const finalMinOrder =
        filteredData.minOrder !== undefined
          ? filteredData.minOrder
          : parseFloat(merchant.minOrder);
      const finalMaxOrder =
        filteredData.maxOrder !== undefined
          ? filteredData.maxOrder
          : parseFloat(merchant.maxOrder);

      if (finalMaxOrder > 0 && finalMinOrder > finalMaxOrder) {
        throw new Error(
          "Minimum order amount cannot be greater than maximum order amount"
        );
      }

      // Validate payment methods
      if (filteredData.paymentMethods !== undefined) {
        if (!Array.isArray(filteredData.paymentMethods)) {
          throw new Error("Payment methods must be an array");
        }

        // Validate each payment method
        const validPaymentMethods = [
          "Bank Transfer",
          "Credit Card",
          "Debit Card",
          "PayPal",
          "Stripe",
          "Cash App",
          "Venmo",
          "Zelle",
          "Wire Transfer",
          "Mobile Money",
          "Cryptocurrency",
          "Other",
        ];

        for (const method of filteredData.paymentMethods) {
          if (typeof method !== "string" || method.trim().length === 0) {
            throw new Error("Each payment method must be a non-empty string");
          }
        }

        // Remove duplicates and empty strings
        filteredData.paymentMethods = [
          ...new Set(
            filteredData.paymentMethods
              .map((m) => m.trim())
              .filter((m) => m.length > 0)
          ),
        ];
      }

      // Validate currency
      if (filteredData.currency !== undefined) {
        const validCurrencies = ["ETH", "USDT", "USDC", "DAI", "BTC"];
        if (!validCurrencies.includes(filteredData.currency.toUpperCase())) {
          throw new Error(
            `Currency must be one of: ${validCurrencies.join(", ")}`
          );
        }
        filteredData.currency = filteredData.currency.toUpperCase();
      }

      // Validate name
      if (filteredData.name !== undefined) {
        if (
          typeof filteredData.name !== "string" ||
          filteredData.name.trim().length < 2
        ) {
          throw new Error("Name must be at least 2 characters long");
        }
        filteredData.name = filteredData.name.trim();
      }

      // Update the merchant
      filteredData.updatedAt = new Date();

      await merchant.update(filteredData);

      logger.info("Merchant profile updated:", {
        merchantId,
        updatedFields: Object.keys(filteredData),
        updatedBy: "merchant_self",
      });

      return merchant;
    } catch (error) {
      logger.error("Error updating merchant profile:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update merchant profile by wallet address
   * @param {string} walletAddress - Merchant's wallet address
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated merchant
   */
  async updateMerchantProfileByAddress(walletAddress, updateData) {
    try {
      const merchant = await this.getMerchantByAddress(walletAddress);
      return await this.updateMerchantProfile(merchant.id, updateData);
    } catch (error) {
      logger.error("Error updating merchant profile by address:", {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new MerchantService();
