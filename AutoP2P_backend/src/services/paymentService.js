const axios = require("axios");
const logger = require("../utils/logger");

class PaymentService {
  constructor() {
    this.apiUrl = process.env.PAYMENT_API_URL;
    this.apiKey = process.env.TOKEN;
    this.clientId = process.env.CLIENT_ID;
    this.accountId = process.env.ACCOUNT_ID;

    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;

    // Create axios instance with defaul  t config
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AirP2P-Backend/1.0",
        accountId: this.accountId,
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        const safeData = { ...config.data };

        // Redact sensitive fields if they exist
        if (safeData.client_id) safeData.client_id = "[REDACTED]";
        if (safeData.client_secret) safeData.client_secret = "[REDACTED]";
        if (safeData.data && safeData.data.access_token)
          safeData.data.access_token = "[REDACTED]";

        if (safeData.data && safeData.data.refresh_token)
          safeData.data.refresh_token = "[REDACTED]";
        logger.info("Payment API Request:", {
          method: config.method,
          url: config.url,
          data: safeData,
        });
        return config;
      },
      (error) => {
        logger.error("Payment API Request Error:", { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        // Deep clone to avoid mutating the real response
        const safeData = JSON.parse(JSON.stringify(response.data));

        // Redact sensitive fields if they exist
        if (safeData.data && safeData.data.access_token)
          safeData.data.access_token = "[REDACTED]";
        if (safeData.data && safeData.data.refresh_token)
          safeData.data.refresh_token = "[REDACTED]";

        logger.info("Payment API Response:", {
          status: response.status,
          data: safeData,
        });
        return response;
      },
      (error) => {
        logger.error("Payment API Response Error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * ensures Access token
   * @returns {string} Access token
   */
  async ensureAccessToken() {
    const now = Date.now();

    // If token exists and is still valid (5 min buffer)
    if (
      this.accessToken &&
      this.expiresAt &&
      now < this.expiresAt - 5 * 60 * 1000
    ) {
      return this.accessToken;
    }

    logger.info("Access token expired or missing — requesting new one...");
    const tokenData = await this.getAccessToken();

    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    this.expiresAt = new Date(tokenData.expiresAt).getTime();

    // Update axios default headers automatically
    this.client.defaults.headers[
      "Authorization"
    ] = `Bearer ${this.accessToken}`;

    return this.accessToken;
  }

  /**
   * Send funds to user
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment result
   */
  async sendFunds(paymentData) {
    const {
      amount,
      accountNumber,
      accountName,
      bankCode,
      merchantTxRef,
      senderName,
      narration,
    } = paymentData;

    try {
      // Ensure access token
      await this.ensureAccessToken();
      console.log(paymentData);

      logger.info("Sending funds:", {
        amount,
        accountNumber,
        accountName,
        bankCode,
        merchantTxRef,
        senderName,
        narration,
      });

      // Validate payment data
      if (!accountNumber || !amount || amount <= 0) {
        throw new Error("Invalid payment data");
      }

      if (!this.apiUrl || !this.apiKey) {
        // Mock payment for development/testing
        return this.mockPayment(paymentData);
      }

      // Prepare payment payload
      const payload = {
        amount,
        accountNumber,
        accountName,
        bankCode,
        merchantTxRef,
        senderName,
        narration,
      };

      // Make API call to payment service
      const response = await this.client.post("/v1/transfers/bank", payload);
      console.log(response.data);

      if (response.status === 200 && response.data.message == "SUCCESS") {
        logger.info(`✅ Payment sent successfully: ${response.data}`);
        return {
          success: true,
          data: response.data,
          paymentId: response.data.id,
        };
      } else {
        throw new Error(response.data.message || "Payment API returned error");
      }
    } catch (error) {
      logger.error(`❌ Payment failed: ${error.message}`);

      return {
        success: false,
        error: error.message,
        details: error.response?.data,
      };
    }
  }

  /**
   * Mock payment for development/testing
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Mock payment result
   */
  async mockPayment(paymentData) {
    const { accountNumber, amount, currency, transactionId, reference } =
      paymentData;

    logger.info(
      `🧪 Mock payment (Development Mode): ${{
        accountNumber,
        amount,
        currency,
        transactionId,
        reference,
      }}`
    );

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate 95% success rate for testing
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      const mockTxHash =
        "0x" + Math.random().toString(16).substr(2, 64).padStart(64, "0");

      return {
        success: true,
        data: {
          payment_id: `mock_${Date.now()}`,
          transaction_hash: mockTxHash,
          status: "completed",
          amount: amount,
          currency: currency,
          recipient: accountNumber,
        },
        paymentId: `mock_${Date.now()}`,
        transactionHash: mockTxHash,
      };
    } else {
      return {
        success: false,
        error: "Mock payment failure for testing",
        details: { code: "MOCK_ERROR", message: "Simulated payment failure" },
      };
    }
  }

  /**
   * Check payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment status
   */
  async checkPaymentStatus(paymentId) {
    try {
      if (!this.apiUrl || !this.apiKey) {
        // Mock status check
        return {
          success: true,
          status: "completed",
          payment_id: paymentId,
        };
      }

      const response = await this.client.get(`/status/${paymentId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error(`Failed to check payment status:`, { error: error.message });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment history
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Payment history
   */
  async getPaymentHistory(filters = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        status = null,
        startDate = null,
        endDate = null,
      } = filters;

      if (!this.apiUrl || !this.apiKey) {
        // Mock history
        return {
          success: true,
          data: {
            payments: [],
            total: 0,
            limit,
            offset,
          },
        };
      }

      const params = { limit, offset };
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await this.client.get("/history", { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error("Failed to get payment history:", { error: error.message });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get access token
   * @returns {Object} token details
   */

  async getAccessToken() {
    try {
      const response = await this.client.post("/v1/auth/token/issue", {
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.apiKey,
      });

      if (response.data.error) {
        logger.error("Failed to get access token:", {
          error: response.data.error,
        });
        throw new Error(response.data.error);
      }
      const { access_token, businessId, refresh_token, expiresAt } =
        response.data.data;
      return { access_token, businessId, refresh_token, expiresAt };
    } catch (error) {
      logger.error("Failed to get access token:", { error: error.message });
      throw error;
    }
  }

  /**
   * get bank code
   */
  async getBankCode() {
    try {
      await this.ensureAccessToken();
      const response = await this.client.get("/v1/transfers/banks");

      if (response.data.error) {
        logger.error("Failed to get bank code:", {
          error: response.data.error,
        });
        throw new Error(response.data.error);
      }
      return response.data.data;
    } catch (error) {
      logger.error("Failed to get bank code:", { error: error.message });
      throw error;
    }
  }

  /**
   * Validate payment service configuration
   * @returns {Object} Validation result
   */
  validateConfig() {
    const issues = [];

    if (!this.apiUrl) {
      issues.push("PAYMENT_API_URL not configured");
    }

    if (!this.apiKey) {
      issues.push("PAYMENT_API_KEY not configured");
    }

    return {
      isValid: issues.length === 0,
      issues,
      mode: issues.length > 0 ? "mock" : "production",
    };
  }
}

module.exports = new PaymentService();
