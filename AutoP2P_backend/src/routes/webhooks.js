const express = require("express");
const webhookController = require("../controllers/webhookController");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Rate limiting for webhooks to prevent abuse
const webhookRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit to 100 requests per minute per IP
  message: {
    success: false,
    message: "Too many webhook requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path.includes("/health");
  },
});

// Apply rate limiting to all webhook routes
router.use(webhookRateLimit);

/**
 * @swagger
 * /api/webhooks/nomba:
 *   post:
 *     summary: Handle Nomba payment webhooks
 *     tags: [Webhooks]
 *     description: Endpoint to receive payment status notifications from Nomba
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Event type
 *                 example: "transfer.successful"
 *               data:
 *                 type: object
 *                 description: Event data
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "nomba_123456"
 *                   reference:
 *                     type: string
 *                     example: "REF_123456789"
 *                   amount:
 *                     type: number
 *                     example: 5000
 *                   currency:
 *                     type: string
 *                     example: "NGN"
 *                   status:
 *                     type: string
 *                     example: "successful"
 *     responses:
 *       200:
 *         description: Webhook processed successfully
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
 *                   example: "Webhook processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       type: string
 *                       example: "transfer.successful"
 *                     processed:
 *                       type: boolean
 *                       example: true
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request or webhook processing failed
 *       401:
 *         description: Invalid webhook signature
 */
router.post("/nomba", webhookController.handleNombaWebhook);

/**
 * @swagger
 * /api/webhooks/nomba/test:
 *   get:
 *     summary: Test webhook configuration
 *     tags: [Webhooks]
 *     description: Check webhook service configuration and status
 *     responses:
 *       200:
 *         description: Webhook configuration status
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
 *                   example: "Webhook configuration status"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configuration:
 *                       type: object
 *                       properties:
 *                         isValid:
 *                           type: boolean
 *                         issues:
 *                           type: array
 *                           items:
 *                             type: string
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         supportedEvents:
 *                           type: array
 *                           items:
 *                             type: string
 *                         secretConfigured:
 *                           type: boolean
 */
router.get("/nomba/test", webhookController.testWebhookConfig);

/**
 * @swagger
 * /api/webhooks/nomba/simulate:
 *   post:
 *     summary: Simulate webhook for testing (dev/test only)
 *     tags: [Webhooks]
 *     description: Simulate a webhook event for testing purposes (not available in production)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [event, data]
 *             properties:
 *               event:
 *                 type: string
 *                 description: Event type to simulate
 *                 example: "transfer.successful"
 *               data:
 *                 type: object
 *                 description: Event data
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "test_123"
 *                   reference:
 *                     type: string
 *                     example: "REF_TEST_123"
 *                   amount:
 *                     type: number
 *                     example: 1000
 *                   currency:
 *                     type: string
 *                     example: "NGN"
 *                   status:
 *                     type: string
 *                     example: "successful"
 *     responses:
 *       200:
 *         description: Webhook simulation completed
 *       400:
 *         description: Invalid simulation request
 *       403:
 *         description: Not allowed in production environment
 */
router.post("/nomba/simulate", webhookController.simulateWebhook);

/**
 * @swagger
 * /api/webhooks/nomba/logs:
 *   get:
 *     summary: Get webhook processing logs
 *     tags: [Webhooks]
 *     description: Get webhook service status and basic logging information
 *     responses:
 *       200:
 *         description: Webhook logs and status
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
 *                   example: "Webhook status information"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                     config:
 *                       type: object
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     note:
 *                       type: string
 */
router.get("/nomba/logs", webhookController.getWebhookLogs);

/**
 * @swagger
 * /api/webhooks/nomba/retry:
 *   post:
 *     summary: Retry failed webhook processing
 *     tags: [Webhooks]
 *     description: Manually retry processing a failed webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payload]
 *             properties:
 *               webhookId:
 *                 type: string
 *                 description: Optional webhook identifier
 *                 example: "webhook_123"
 *               payload:
 *                 type: object
 *                 description: Original webhook payload
 *               signature:
 *                 type: string
 *                 description: Optional webhook signature
 *     responses:
 *       200:
 *         description: Webhook retry completed
 *       400:
 *         description: Invalid retry request
 *       500:
 *         description: Retry processing failed
 */
router.post("/nomba/retry", webhookController.retryWebhook);

/**
 * @swagger
 * /api/webhooks/health:
 *   get:
 *     summary: Webhook service health check
 *     tags: [Webhooks]
 *     description: Check if webhook service is healthy and operational
 *     responses:
 *       200:
 *         description: Service is healthy
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
 *                   example: "Webhook service is healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                       example: "nomba-webhook"
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     configValid:
 *                       type: boolean
 *                     supportedEvents:
 *                       type: array
 *                       items:
 *                         type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       503:
 *         description: Service is unhealthy
 */
router.get("/health", webhookController.webhookHealthCheck);

module.exports = router;
