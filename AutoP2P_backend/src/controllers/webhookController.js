const nombaWebhookService = require('../services/nombaWebhookService');
const logger = require('../utils/logger');

class WebhookController {
  /**
   * Handle incoming Nomba webhook
   * POST /api/webhooks/nomba
   */
  async handleNombaWebhook(req, res) {
    try {
      // Get signature and timestamp from headers
      const signature = req.headers['x-nomba-signature'] || 
                       req.headers['x-webhook-signature'] || 
                       req.headers['nomba-signature'];
      
      const timestamp = req.headers['x-nomba-timestamp'] || 
                       req.headers['x-webhook-timestamp'] || 
                       req.headers['nomba-timestamp'];

      const payload = req.body;

      logger.info('Received Nomba webhook:', {
        event: payload.event_type || payload.event,
        hasSignature: !!signature,
        hasTimestamp: !!timestamp,
        timestamp: new Date().toISOString()
      });

      // Process webhook using service
      const result = await nombaWebhookService.processWebhook(payload, signature, timestamp);

      if (result.success) {
        logger.info('Webhook processed successfully:', {
          event: payload.event,
          result: result.result
        });

        return res.status(200).json({
          success: true,
          message: result.message,
          data: {
            event: result.event,
            processed: true,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        logger.error('Webhook processing failed:', {
          event: payload.event,
          error: result.error
        });

        return res.status(400).json({
          success: false,
          message: 'Webhook processing failed',
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Error in webhook controller:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });

      // Always return 200 to prevent webhook retries for non-signature issues
      // Only return 4xx for signature/validation failures
      const statusCode = error.message.includes('signature') ? 401 : 200;
      
      return res.status(statusCode).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Webhook processing failed'
      });
    }
  }

  /**
   * Test webhook configuration and setup
   * GET /api/webhooks/nomba/test
   */
  async testWebhookConfig(req, res) {
    try {
      const config = nombaWebhookService.validateConfig();
      const stats = nombaWebhookService.getWebhookStats();

      return res.status(200).json({
        success: true,
        message: 'Webhook configuration status',
        data: {
          configuration: config,
          statistics: stats,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error testing webhook config:', {
        error: error.message
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to test webhook configuration',
        error: error.message
      });
    }
  }

  /**
   * Simulate webhook for testing purposes
   * POST /api/webhooks/nomba/simulate
   */
  async simulateWebhook(req, res) {
    try {
      // Only allow in development/testing environments
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Webhook simulation not allowed in production'
        });
      }

      const { event_type, data } = req.body;

      if (!event_type || !data) {
        return res.status(400).json({
          success: false,
          message: 'event_type and data are required for simulation'
        });
      }

      // Create mock payload in Nomba format
      const mockPayload = {
        event_type: event_type || 'payment_success',
        requestId: `mock_${Date.now()}`,
        data: {
          merchant: {
            walletId: data.walletId || `wallet_${Date.now()}`,
            walletBalance: data.walletBalance || 5000,
            userId: data.userId || `user_${Date.now()}`
          },
          transaction: {
            transactionId: data.transactionId || `TXN_${Date.now()}`,
            aliasAccountReference: data.reference || `REF_${Date.now()}`,
            transactionAmount: data.amount || 1000,
            sessionId: data.sessionId || `SESSION_${Date.now()}`,
            type: data.type || 'vact_transfer',
            time: data.time || new Date().toISOString(),
            narration: data.narration || 'Test transfer',
            responseCode: data.responseCode || '',
            ...data.transaction
          },
          customer: {
            senderName: data.senderName || 'Test User',
            accountNumber: data.accountNumber || '0000000000',
            bankCode: data.bankCode || '090645',
            bankName: data.bankName || 'Test Bank',
            ...data.customer
          },
          ...data
        }
      };

      logger.info('Simulating Nomba webhook:', {
        event_type,
        requestId: mockPayload.requestId,
        transactionId: mockPayload.data.transaction.transactionId
      });

      // Process without signature verification in test mode
      const result = await nombaWebhookService.processWebhook(mockPayload, null, new Date().toISOString());

      return res.status(200).json({
        success: true,
        message: 'Webhook simulation completed',
        data: {
          mockPayload,
          result,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error simulating webhook:', {
        error: error.message
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to simulate webhook',
        error: error.message
      });
    }
  }

  /**
   * Get webhook logs (for debugging)
   * GET /api/webhooks/nomba/logs
   */
  async getWebhookLogs(req, res) {
    try {
      // This would typically read from your logging system
      // For now, return basic stats
      const stats = nombaWebhookService.getWebhookStats();
      const config = nombaWebhookService.validateConfig();

      return res.status(200).json({
        success: true,
        message: 'Webhook status information',
        data: {
          stats,
          config,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          note: 'For detailed logs, check your logging system'
        }
      });

    } catch (error) {
      logger.error('Error getting webhook logs:', {
        error: error.message
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to get webhook logs',
        error: error.message
      });
    }
  }

  /**
   * Health check for webhook endpoint
   * GET /api/webhooks/health
   */
  async webhookHealthCheck(req, res) {
    try {
      const config = nombaWebhookService.validateConfig();

      return res.status(200).json({
        success: true,
        message: 'Webhook service is healthy',
        data: {
          service: 'nomba-webhook',
          status: 'healthy',
          configValid: config.isValid,
          supportedEvents: nombaWebhookService.getWebhookStats().supportedEvents,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Webhook health check failed:', {
        error: error.message
      });

      return res.status(503).json({
        success: false,
        message: 'Webhook service unhealthy',
        error: error.message
      });
    }
  }

  /**
   * Retry failed webhook processing
   * POST /api/webhooks/nomba/retry
   */
  async retryWebhook(req, res) {
    try {
      const { webhookId, payload, signature } = req.body;

      if (!payload) {
        return res.status(400).json({
          success: false,
          message: 'Webhook payload is required for retry'
        });
      }

      logger.info('Retrying webhook processing:', {
        webhookId,
        event: payload.event
      });

      const result = await nombaWebhookService.processWebhook(payload, signature);

      return res.status(200).json({
        success: true,
        message: 'Webhook retry completed',
        data: {
          webhookId,
          retryResult: result,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error retrying webhook:', {
        error: error.message
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to retry webhook',
        error: error.message
      });
    }
  }
}

module.exports = new WebhookController();