const express = require('express');
const merchantRoutes = require('./merchants');
const transactionRoutes = require('./transactions');
const webhookRoutes = require('./webhooks');
const adRoutes = require('./ads');
const paymentRoutes = require('./payments');

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API server is running and healthy
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AirP2P Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
router.use('/merchants', merchantRoutes);
router.use('/transactions', transactionRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/ads', adRoutes);
router.use('/payments', paymentRoutes);

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API information and endpoints
 *     description: Get comprehensive information about available API endpoints and system details
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'AirP2P Backend API'
 *                 version:
 *                   type: string
 *                   example: '1.0.0'
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     merchants:
 *                       type: object
 *                       description: Merchant-related endpoints
 *                     transactions:
 *                       type: object
 *                       description: Transaction-related endpoints
 *                     system:
 *                       type: object
 *                       description: System-related endpoints
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AirP2P Backend API',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      merchants: {
        'GET /merchants': 'Get all merchants with pagination and filtering',
        'POST /merchants': 'Create a new merchant',
        'GET /merchants/:walletAddress': 'Get merchant by wallet address',
        'GET /merchants/:walletAddress/rate': 'Get merchant ad rate',
        'PUT /merchants/:merchantId/rate': 'Update merchant ad rate (legacy)',
        'PUT /merchants/:merchantId/profile': 'Update merchant profile by ID',
        'PUT /merchants/wallet/:walletAddress/profile': 'Update merchant profile by wallet address',
        'GET /merchants/:merchantId/stats': 'Get merchant statistics',
        'GET /merchants/:merchantId/transactions': 'Get merchant transactions'
      },
      ads: {
        'GET /ads': 'Get all advertisements with filtering and pagination',
        'GET /ads/search': 'Search advertisements',
        'GET /ads/summary': 'Get active ads summary by token',
        'GET /ads/:adId': 'Get advertisement by ID',
        'GET /ads/:adId/stats': 'Get advertisement statistics',
        'GET /merchants/:merchantId/ads': 'Get merchant advertisements',
        'POST /merchants/:merchantId/ads': 'Create new advertisement',
        'PUT /merchants/:merchantId/ads/:adId': 'Update advertisement',
        'DELETE /merchants/:merchantId/ads/:adId': 'Delete advertisement',
        'PATCH /merchants/:merchantId/ads/:adId/toggle': 'Toggle advertisement status'
      },
      transactions: {
        'GET /transactions/:txHash': 'Get transaction by hash',
        'GET /transactions/user/:walletAddress': 'Get user transactions',
        'POST /transactions/process': 'Manual deposit processing (testing)',
        'GET /transactions/listener/status': 'Get event listener status',
        'POST /transactions/listener/start': 'Start event listener',
        'POST /transactions/listener/stop': 'Stop event listener',
        'GET /transactions/payment/:paymentId/status': 'Check payment status',
        'GET /transactions/payment/history': 'Get payment history',
        'GET /transactions/payment/config/test': 'Test payment configuration'
      },
      webhooks: {
        'POST /webhooks/nomba': 'Handle Nomba payment webhooks',
        'GET /webhooks/nomba/test': 'Test webhook configuration',
        'POST /webhooks/nomba/simulate': 'Simulate webhook for testing',
        'GET /webhooks/nomba/logs': 'Get webhook processing logs',
        'POST /webhooks/nomba/retry': 'Retry failed webhook processing',
        'GET /webhooks/health': 'Webhook service health check'
      },
      payments: {
        'GET /payments/banks': 'Get all supported banks and codes',
        'GET /payments/banks/search': 'Search banks by name',
        'GET /payments/banks/:bankCode': 'Get bank details by code',
        'GET /payments/config': 'Get payment configuration status'
      },
      system: {
        'GET /health': 'Health check',
        'GET /': 'API documentation'
      }
    }
  });
});

module.exports = router;