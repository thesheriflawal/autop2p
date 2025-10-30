const crypto = require("crypto");
const { Transaction } = require("../models");
const logger = require("../utils/logger");
const paymentService = require("./paymentService");
const merchantService = require("./merchantService");
const {
  walletClient,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} = require("../config/blockchain");

class NombaWebhookService {
  constructor() {
    this.webhookSecret = process.env.NOMBA_WEBHOOK_SECRET;
    this.supportedEvents = [
      "transfer.successful",
      "transfer.failed",
      "transfer.reversed",
      "payment.successful",
      "payment.failed",
      "payment.reversal",
    ];
    // Nomba event types mapping
    this.nombaEventMapping = {
      payment_success: "payment.successful",
      payment_failed: "payment.failed",
      payment_reversal: "payment.reversal",
      payout_success: "transfer.successful",
      payout_failed: "transfer.failed",
      payout_refund: "transfer.reversed",
    };
  }

  /**
   * Map Nomba event types to internal event types
   * @param {string} nombaEvent - Nomba event type
   * @returns {string|null} - Mapped event type or null if unsupported
   */
  mapNombaEvent(nombaEvent) {
    return this.nombaEventMapping[nombaEvent] || null;
  }

  /**
   * Verify webhook signature from Nomba
   * @param {string} payload - Raw request body
   * @param {string} signature - Signature from x-nomba-signature header
   * @param {string} timestamp - Timestamp from x-nomba-timestamp header
   * @returns {boolean} - Whether signature is valid
   */
  verifyWebhookSignature(payload, signature, timestamp) {
    try {
      if (!this.webhookSecret) {
        logger.warn(
          "Nomba webhook secret not configured, skipping signature verification"
        );
        return true; // Allow in development if not configured
      }

      if (!signature) {
        logger.error("No signature provided in webhook request");
        return false;
      }

      if (!timestamp) {
        logger.error("No timestamp provided in webhook request");
        return false;
      }

      // Generate signature using Nomba's specific method
      const expectedSignature = this.generateNombaSignature(
        payload,
        this.webhookSecret,
        timestamp
      );

      // Use timingSafeEqual to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "base64"),
        Buffer.from(signature, "base64")
      );

      if (!isValid) {
        logger.error("Invalid webhook signature", {
          expected: expectedSignature,
          received: signature,
          timestamp,
        });
      }

      return isValid;
    } catch (error) {
      logger.error("Error verifying webhook signature:", {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Generate Nomba webhook signature using their specific algorithm
   * @param {string} payload - Raw request body
   * @param {string} secret - Webhook secret
   * @param {string} timestamp - Timestamp from header
   * @returns {string} - Base64 encoded signature
   */
  generateNombaSignature(payload, secret, timestamp) {
    try {
      const requestPayload = JSON.parse(payload);
      const data = requestPayload.data || {};
      const merchant = data.merchant || {};
      const transaction = data.transaction || {};

      const eventType = requestPayload.event_type || "";
      const requestId = requestPayload.requestId || "";
      const userId = merchant.userId || "";
      const walletId = merchant.walletId || "";
      const transactionId = transaction.transactionId || "";
      const transactionType = transaction.type || "";
      const transactionTime = transaction.time || "";
      let transactionResponseCode = transaction.responseCode || "";

      // Handle null response code
      if (
        transactionResponseCode === "null" ||
        transactionResponseCode === null
      ) {
        transactionResponseCode = "";
      }

      // Create the hashing payload according to Nomba's specification
      const hashingPayload = `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${transactionType}:${transactionTime}:${transactionResponseCode}:${timestamp}`;

      logger.debug("Nomba signature payload to hash:", { hashingPayload });

      // Generate HMAC SHA256 signature in base64 format
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(hashingPayload);
      const hash = hmac.digest("base64");

      return hash;
    } catch (error) {
      logger.error("Error generating Nomba signature:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Process incoming webhook from Nomba
   * @param {Object} payload - Webhook payload
   * @param {string} signature - Webhook signature
   * @param {string} timestamp - Webhook timestamp
   * @returns {Promise<Object>} - Processing result
   */
  async processWebhook(payload, signature, timestamp) {
    console.log(payload);
    try {
      // Verify signature first
      if (
        !this.verifyWebhookSignature(
          JSON.stringify(payload),
          signature,
          timestamp
        )
      ) {
        throw new Error("Invalid webhook signature");
      }

      const event = payload.event_type || payload.event;
      const data = payload.data;

      if (!event || !data) {
        throw new Error("Invalid webhook payload format");
      }

      const transaction = data.transaction || {};
      logger.info("Processing Nomba webhook:", {
        event,
        requestId: payload.requestId,
        transactionId: transaction.transactionId || transaction.id,
        transactionType: transaction.type,
      });

      // Map Nomba event types to our supported events
      const mappedEvent = this.mapNombaEvent(event);

      if (!mappedEvent) {
        logger.warn(`Unsupported webhook event: ${event}`);
        return {
          success: true,
          message: "Event not supported, ignored",
          event,
        };
      }

      // Process based on mapped event type
      let result;
      switch (mappedEvent) {
        case "transfer.successful":
          result = await this.handleTransferSuccessful(data, payload);
          break;
        case "transfer.failed":
          result = await this.handleTransferFailed(data, payload);
          break;
        case "transfer.pending":
          result = await this.handleTransferPending(data, payload);
          break;
        case "transfer.reversed":
          result = await this.handleTransferReversed(data, payload);
          break;
        case "payment.successful":
          result = await this.handlePaymentSuccessful(data, payload);
          break;
        case "payment.failed":
          result = await this.handlePaymentFailed(data, payload);
          break;
        case "payment.pending":
          result = await this.handlePaymentPending(data, payload);
          break;
        default:
          result = await this.handleGenericEvent(mappedEvent, data, payload);
      }

      logger.info("Webhook processed successfully:", {
        event,
        result,
      });

      return {
        success: true,
        message: "Webhook processed successfully",
        event,
        result,
      };
    } catch (error) {
      logger.error("Error processing Nomba webhook:", {
        error: error.message,
        payload,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle successful transfer webhook
   * @param {Object} data - Transfer data from Nomba
   * @param {Object} payload - Full webhook payload
   * @returns {Promise<Object>} - Processing result
   */
  async handleTransferSuccessful(data, payload) {
    const transaction = data.transaction || {};
    const customer = data.customer || {};
    const merchant = data.merchant || {};

    console.log(transaction);

    const {
      transactionId,
      aliasAccountReference,
      transactionAmount,
      sessionId,
      time,
      narration,
      merchantTxRef,
      type: transactionType,
    } = transaction;

    try {
      // Find transaction by various reference fields
      const dbTransaction = await this.findTransactionByReference(
        merchantTxRef
      );

      if (!dbTransaction) {
        logger.warn("Transaction not found for successful transfer:", {
          transactionId,
          aliasAccountReference,
          sessionId,
          requestId: payload.requestId,
        });
        return {
          action: "ignored",
          reason: "Transaction not found in local database",
          reference: transactionId,
        };
      }

      // Update transaction status (our enum uses CONFIRMED)
      const updateData = {
        status: "CONFIRMED",
        updatedAt: new Date(time || Date.now()),
      };

      const updatedMetadata = {
        paymentStatus: "successful",
        nombaTransferId: transactionId,
        nombaReference: aliasAccountReference,
        nombaSessionId: sessionId,
      };

      // Add additional data if available
      if (customer) updatedMetadata.customerInfo = customer;
      if (merchant) updatedMetadata.merchantInfo = merchant;
      if (narration) updatedMetadata.narration = narration;

      // Optionally call completeTrade on-chain if tradeId exists
      let completeTradeTxHash = null;
      if (walletClient && dbTransaction.tradeId != null) {
        try {
          const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "completeTrade",
            args: [BigInt(String(dbTransaction.tradeId))],
          });
          completeTradeTxHash = hash;
          updateData.completeTradeTxHash = hash;
        } catch (err) {
          logger.error("completeTrade call failed (webhook path):", {
            error: err.message,
            tradeId: dbTransaction.tradeId,
          });
        }
      }

      await dbTransaction.update({
        ...updateData,
        metadata: {
          ...(dbTransaction.metadata || {}),
          completeTradeTxHash,
          ...updatedMetadata,
        },
      });

      // Log successful completion
      logger.info("Transfer marked as successful:", {
        transactionId: dbTransaction.id,
        nombaId: transactionId,
        amount: transactionAmount,
        type: transactionType,
      });

      // Trigger any post-success actions (notifications, etc.)
      await this.onTransferSuccess(dbTransaction, payload);

      return {
        action: "updated",
        transactionId: dbTransaction.id,
        status: "successful",
        amount: transactionAmount,
        type: transactionType,
      };
    } catch (error) {
      logger.error("Error handling successful transfer:", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Handle failed transfer webhook
   * @param {Object} data - Transfer data
   * @returns {Promise<Object>} - Processing result
   */
  async handleTransferFailed(data) {
    const {
      id,
      reference,
      amount,
      currency,
      status,
      failureReason,
      merchantTxRef,
    } = data;

    try {
      const transaction = await this.findTransactionByReference(
        reference || merchantTxRef || id
      );

      if (!transaction) {
        logger.warn("Transaction not found for failed transfer:", {
          reference,
          merchantTxRef,
          id,
        });
        return {
          action: "ignored",
          reason: "Transaction not found in local database",
          reference,
        };
      }

      // Update transaction status
      const updateData = {
        status: "failed",
        paymentStatus: "failed",
        nombaTransferId: id,
        nombaReference: reference,
        failureReason: failureReason || "Transfer failed",
        updatedAt: new Date(),
      };

      await transaction.update(updateData);

      logger.error("Transfer marked as failed:", {
        transactionId: transaction.id,
        nombaId: id,
        reason: failureReason,
        amount,
        currency,
      });

      // Trigger failure handling actions
      await this.onTransferFailure(transaction, data);

      return {
        action: "updated",
        transactionId: transaction.id,
        status: "failed",
        reason: failureReason,
        amount,
        currency,
      };
    } catch (error) {
      logger.error("Error handling failed transfer:", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Handle pending transfer webhook
   * @param {Object} data - Transfer data
   * @returns {Promise<Object>} - Processing result
   */
  async handleTransferPending(data) {
    const { id, reference, amount, currency, merchantTxRef } = data;

    try {
      const transaction = await this.findTransactionByReference(
        reference || merchantTxRef || id
      );

      if (transaction) {
        await transaction.update({
          status: "pending",
          paymentStatus: "pending",
          nombaTransferId: id,
          nombaReference: reference,
          updatedAt: new Date(),
        });

        logger.info("Transfer marked as pending:", {
          transactionId: transaction.id,
          nombaId: id,
          amount,
          currency,
        });
      }

      return {
        action: transaction ? "updated" : "ignored",
        status: "pending",
        amount,
        currency,
      };
    } catch (error) {
      logger.error("Error handling pending transfer:", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Handle reversed transfer webhook
   * @param {Object} data - Transfer data
   * @returns {Promise<Object>} - Processing result
   */
  async handleTransferReversed(data) {
    const { id, reference, amount, currency, reversalReason, merchantTxRef } =
      data;

    try {
      const transaction = await this.findTransactionByReference(
        reference || merchantTxRef || id
      );

      if (transaction) {
        await transaction.update({
          status: "reversed",
          paymentStatus: "reversed",
          nombaTransferId: id,
          nombaReference: reference,
          reversalReason: reversalReason || "Transfer reversed",
          updatedAt: new Date(),
        });

        logger.warn("Transfer reversed:", {
          transactionId: transaction.id,
          nombaId: id,
          reason: reversalReason,
          amount,
          currency,
        });

        // Handle reversal actions (refunds, notifications, etc.)
        await this.onTransferReversal(transaction, data);
      }

      return {
        action: transaction ? "updated" : "ignored",
        status: "reversed",
        reason: reversalReason,
        amount,
        currency,
      };
    } catch (error) {
      logger.error("Error handling reversed transfer:", {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Handle payment successful webhook (for incoming payments)
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Processing result
   */
  async handlePaymentSuccessful(data, payload) {
    try {
      const transaction = data.transaction || {};
      const order = data.order || {};

      const {
        transactionId,
        merchantTxRef,
        transactionAmount,
        aliasAccountReference,
      } = transaction;

      const { amount, customerEmail } = order;

      // Use transaction amount or order amount
      const paymentAmount = transactionAmount || amount;

      // Extract customer email from various sources

      if (!customerEmail) {
        logger.warn("No customer email provided in payment webhook:", {
          transactionId,
          data,
        });

        return {
          action: "logged",
          type: "incoming_payment",
          status: "successful",
          error: "No customer email provided",
          transactionId,
        };
      }

      // Get merchant by email and update balance
      let balanceUpdateResult = null;
      try {
        const merchant = await merchantService.getMerchantByEmail(
          customerEmail
        );

        const updatedMerchant = await merchantService.updateBalance(
          merchant.id,
          paymentAmount,
          "add"
        );

        balanceUpdateResult = {
          merchantId: merchant.id,
          merchantEmail: merchant.email,
          merchantName: merchant.name,
          amountAdded: paymentAmount,
          newBalance: updatedMerchant.balance,
        };

        logger.info("Merchant balance updated via payment webhook:", {
          merchantId: merchant.id,
          merchantEmail: merchant.email,
          transactionId,
          amountAdded: paymentAmount,
          newBalance: updatedMerchant.balance,
        });
      } catch (merchantError) {
        logger.error("Error updating merchant balance:", {
          customerEmail: customerEmail,
          error: merchantError.message,
          transactionId,
        });

        balanceUpdateResult = {
          error: merchantError.message,
          customerEmail: customerEmail,
        };
      }

      logger.info("Incoming payment successful:", {
        transactionId,
        customerEmail: customerEmail,
        amount: paymentAmount,
        balanceUpdated: !!balanceUpdateResult && !balanceUpdateResult.error,
      });

      return {
        action: "processed",
        type: "incoming_payment",
        status: "successful",
        amount: paymentAmount,
        customerEmail: customerEmail,
        transactionId,
        balanceUpdate: balanceUpdateResult,
      };
    } catch (error) {
      logger.error("Error handling payment successful webhook:", {
        error: error.message,
        data,
      });

      return {
        action: "error",
        type: "incoming_payment",
        status: "failed",
        error: error.message,
      };
    }
  }

  /**
   * Handle payment failed webhook
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Processing result
   */
  async handlePaymentFailed(data) {
    const { id, reference, amount, currency, failureReason } = data;

    logger.warn("Incoming payment failed:", {
      id,
      reference,
      amount,
      currency,
      reason: failureReason,
    });

    return {
      action: "logged",
      type: "incoming_payment",
      status: "failed",
      reason: failureReason,
      amount,
      currency,
    };
  }

  /**
   * Handle payment pending webhook
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Processing result
   */
  async handlePaymentPending(data) {
    const { id, reference, amount, currency } = data;

    logger.info("Incoming payment pending:", {
      id,
      reference,
      amount,
      currency,
    });

    return {
      action: "logged",
      type: "incoming_payment",
      status: "pending",
      amount,
      currency,
    };
  }

  /**
   * Handle generic webhook events
   * @param {string} event - Event type
   * @param {Object} data - Event data
   * @returns {Promise<Object>} - Processing result
   */
  async handleGenericEvent(event, data) {
    logger.info("Handling generic webhook event:", {
      event,
      data,
    });

    return {
      action: "logged",
      event,
      status: "processed",
    };
  }

  /**
   * Find transaction by reference in database
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object|null>} - Transaction or null
   */
  async findTransactionByReference(reference) {
    try {
      if (!reference) {
        return null;
      }

      // Import Sequelize Op if available
      const { Op } = require("sequelize");

      // Try to find by various reference fields
      const transaction = await Transaction.findOne({
        where: {
          [Op.or]: [{ txHash: reference }],
        },
      });

      return transaction;
    } catch (error) {
      logger.error("Error finding transaction by reference:", {
        error: error.message,
        reference,
      });
      return null;
    }
  }

  /**
   * Actions to perform after successful transfer
   * @param {Object} transaction - Transaction object
   * @param {Object} webhookData - Webhook data
   */
  async onTransferSuccess(transaction, webhookData) {
    try {
      // Send success notification to user/merchant
      // Update merchant balance
      // Trigger any business logic

      logger.info("Transfer success actions completed:", {
        transactionId: transaction.id,
      });
    } catch (error) {
      logger.error("Error in transfer success actions:", {
        error: error.message,
        transactionId: transaction.id,
      });
    }
  }

  /**
   * Actions to perform after transfer failure
   * @param {Object} transaction - Transaction object
   * @param {Object} webhookData - Webhook data
   */
  async onTransferFailure(transaction, webhookData) {
    try {
      // Send failure notification
      // Handle refund logic
      // Update user/merchant status

      logger.info("Transfer failure actions completed:", {
        transactionId: transaction.id,
      });
    } catch (error) {
      logger.error("Error in transfer failure actions:", {
        error: error.message,
        transactionId: transaction.id,
      });
    }
  }

  /**
   * Actions to perform after transfer reversal
   * @param {Object} transaction - Transaction object
   * @param {Object} webhookData - Webhook data
   */
  async onTransferReversal(transaction, webhookData) {
    try {
      // Handle reversal logic
      // Issue refunds
      // Send notifications

      logger.info("Transfer reversal actions completed:", {
        transactionId: transaction.id,
      });
    } catch (error) {
      logger.error("Error in transfer reversal actions:", {
        error: error.message,
        transactionId: transaction.id,
      });
    }
  }

  /**
   * Get webhook statistics
   * @returns {Object} - Webhook processing statistics
   */
  getWebhookStats() {
    // This could be enhanced to track webhook processing metrics
    return {
      supportedEvents: this.supportedEvents,
      secretConfigured: !!this.webhookSecret,
    };
  }

  /**
   * Validate webhook configuration
   * @returns {Object} - Configuration validation result
   */
  validateConfig() {
    const issues = [];

    if (!this.webhookSecret) {
      issues.push("NOMBA_WEBHOOK_SECRET not configured");
    }

    return {
      isValid: issues.length === 0,
      issues,
      supportedEvents: this.supportedEvents,
    };
  }
}

module.exports = new NombaWebhookService();
