const { Transaction, User, Merchant } = require("../models");
const merchantService = require("./merchantService");
const paymentService = require("./paymentService");
const adService = require("./adService");
const {
  walletClient,
  publicClient,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} = require("../config/blockchain");
const logger = require("../utils/logger");
const { formatUnits } = require("viem");

class DepositService {
  /**
   * Process a deposit from blockchain event
   * @param {Object} depositData - Deposit event data
   * @returns {Promise<Object>} Processing result
   */
  async processPayment(depositData) {
    const {
      buyer,
      txHash,
      amount,
      accountNumber,
      accountName,
      bankCode,
      merchantId,
      adId,
      timestamp,
      blockNumber,
      tradeId,
    } = depositData;

    try {
      logger.info("Processing payment:", {
        tradeId,
        txHash,
        accountNumber,
        accountName,
        bankCode,
        merchantId,
      });

      // Check if transaction already exists
      const existingTx = await Transaction.findOne({ where: { txHash } });
      if (existingTx) {
        logger.warn("Found existing transaction for txHash", {
          txHash,
          status: existingTx.status,
          id: existingTx.id,
        });
        // Allow retries only if the previous attempt failed
        if (existingTx.status !== "FAILED") {
          logger.warn(
            "Transaction already processed or in progress — skipping",
            { txHash, status: existingTx.status }
          );
          return {
            success: true,
            message: "Transaction already processed",
            transaction: existingTx,
          };
        }
        logger.info("Retrying previously failed transaction", { txHash });
      }

      // Get or create user
      const user = await this.getOrCreateUser(buyer);

      const formatedAmount = formatUnits(Number(amount), 6);

      // Calculate amount using ad's rate (adId provided by event)
      if (!adId) {
        throw new Error("adId missing in deposit event");
      }
      const ad = await adService.getAdById(Number(adId));
      const merchant = ad.merchant;
      const rate = parseFloat(ad.rate);
      const depositAmount = parseFloat(formatedAmount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        throw new Error("Invalid deposit amount");
      }
      const calculatedAmount = depositAmount * rate;

      // Ensure merchant has sufficient balance
      const currentBalance = parseFloat(merchant.balance);
      if (currentBalance < calculatedAmount) {
        throw new Error("Insufficient merchant balance");
      }

      logger.info("Calculated amount (ad-based):", {
        adId,
        calculatedAmount,
        rate,
        merchant: JSON.stringify({ id: merchant.id, name: merchant.name }),
      });

      // Create or reuse transaction record
      let transaction;
      if (!existingTx) {
        transaction = await Transaction.create({
          tradeId,
          txHash,
          fromAddress: buyer.toLowerCase(),
          merchantId: merchant.id,
          userId: user.id,
          amount: amount,
          calculatedAmount: calculatedAmount,
          adRate: rate,
          blockNumber: blockNumber,
          status: "PENDING",
          type: "DEPOSIT",
          metadata: {
            timestamp,
            originalEvent: depositData,
            adId: Number(adId),
            adRate: rate,
          },
        });
        logger.info("Transaction record created", {
          transactionId: transaction.id,
        });
      } else {
        transaction = existingTx;
        await transaction.update({
          status: "PENDING",
          metadata: {
            ...(transaction.metadata || {}),
            retryAt: new Date().toISOString(),
            originalEvent: depositData,
            adId: Number(adId),
            adRate: rate,
          },
        });
        logger.info("Reprocessing existing FAILED transaction", {
          transactionId: transaction.id,
        });
      }

      const senderName = merchant.name;
      const merchantTxRef = txHash;
      const narration = "payment";

      // Deduct merchant balance before initiating payout (reserve funds)
      await merchantService.updateBalance(merchant.id, calculatedAmount);

      // Send funds to user via payment API
      const paymentResult = await paymentService.sendFunds({
        amount: calculatedAmount,
        accountNumber,
        accountName,
        bankCode,
        merchantTxRef,
        senderName,
        narration,
      });

      if (paymentResult.success) {
        // Call completeTrade on-chain (best-effort)
        let completeTradeTxHash = null;
        if (!walletClient) {
          logger.warn(
            "Wallet client not configured — skipping on-chain completeTrade"
          );
        } else if (tradeId === undefined || tradeId === null) {
          logger.warn("tradeId missing — skipping on-chain completeTrade");
        } else {
          try {
            const hash = await walletClient.writeContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: "completeTrade",
              args: [BigInt(String(tradeId))],
            });
            completeTradeTxHash = hash;
            logger.info("completeTrade submitted", { tradeId, txHash: hash });
            // Optional: wait for confirmation (commented to avoid blocking)
            // await publicClient.waitForTransactionReceipt({ hash });
          } catch (chainErr) {
            logger.error("completeTrade call failed", {
              tradeId,
              error: chainErr.message,
            });
          }
        }

        // Update transaction status
        await transaction.update({
          status: "CONFIRMED",
          metadata: {
            ...transaction.metadata,
            paymentResult,
            completeTradeTxHash,
          },
        });

        logger.info("✅ Deposit processed successfully:", {
          txHash,
          calculatedAmount,
          merchantBalance: parseFloat(merchant.balance) - calculatedAmount,
        });

        return {
          success: true,
          transaction,
          paymentResult,
          calculatedAmount,
          rate
        };
      } else {
        // Payment not confirmed yet. Keep as PENDING and rely on webhook to finalize.
        const isProcessing = /process/i.test(paymentResult.error || '') || /pending/i.test(paymentResult.error || '');
        await transaction.update({
          status: isProcessing ? "PENDING" : "FAILED",
          metadata: {
            ...transaction.metadata,
            paymentError: paymentResult.error,
          },
        });

        const level = isProcessing ? 'warn' : 'error';
        logger[level](isProcessing ? "Payment pending for transaction" : "Payment failed for transaction", {
          txHash,
          error: paymentResult.error,
        });
        if (!isProcessing) throw new Error("Payment processing failed");
        return { success: false, pending: true, transaction, error: paymentResult.error };
      }
    } catch (error) {
      logger.error("Error processing deposit:", { error: error.message });

      // Try to update transaction status if it exists
      try {
        const failedTx = await Transaction.findOne({ where: { txHash } });
        if (failedTx) {
          await failedTx.update({
            status: "FAILED",
            metadata: {
              ...failedTx.metadata,
              error: error.message,
            },
          });
        }
      } catch (updateError) {
        logger.error("Failed to update transaction status:", { updateError });
      }

      throw error;
    }
  }

  /**
   * Get existing user or create new one
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} User object
   */
  async getOrCreateUser(walletAddress) {
    try {
      let user = await User.findOne({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (!user) {
        user = await User.create({
          walletAddress: walletAddress.toLowerCase(),
        });
        logger.info("New user created:", { userId: user.id });
      }

      return user;
    } catch (error) {
      logger.error("Error getting or creating user:", { error: error.message });
      throw error;
    }
  }

  /**
   * Get transaction by hash
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} Transaction object
   */
  async getTransactionByHash(txHash) {
    try {
      const transaction = await Transaction.findOne({
        where: { txHash },
        include: [
          { model: Merchant, as: "merchant" },
          { model: User, as: "user" },
        ],
      });

      return transaction;
    } catch (error) {
      logger.error("Error getting transaction by hash:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get transactions for a user
   * @param {string} walletAddress - User's wallet address
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of transactions
   */
  async getUserTransactions(walletAddress, options = {}) {
    try {
      const { limit = 50, offset = 0, status = null } = options;

      const user = await User.findOne({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (!user) {
        return [];
      }

      const where = { userId: user.id };
      if (status) {
        where.status = status;
      }

      const transactions = await Transaction.findAll({
        where,
        include: [{ model: Merchant, as: "merchant" }],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return transactions;
    } catch (error) {
      logger.error("Error getting user transactions:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get transactions for a merchant
   * @param {string} merchantId - Merchant's ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of transactions
   */
  async getMerchantTransactions(merchantId, options = {}) {
    try {
      const { limit = 50, offset = 0, status = null } = options;

      const where = { merchantId };
      if (status) {
        where.status = status;
      }

      const transactions = await Transaction.findAll({
        where,
        include: [{ model: User, as: "user" }],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return transactions;
    } catch (error) {
      logger.error("Error getting merchant transactions:", {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = {
  processPayment: new DepositService().processPayment.bind(
    new DepositService()
  ),
  DepositService: new DepositService(),
};
