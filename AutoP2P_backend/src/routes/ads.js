const express = require("express");
const adController = require("../controllers/adController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Advertisements
 *   description: Advertisement management for merchants
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ad:
 *       type: object
 *       required:
 *         - merchantId
 *         - title
 *         - token
 *         - exchangeRate
 *         - minAmount
 *         - maxAmount
 *         - availableAmount
 *         - paymentMethods
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the ad
 *         merchantId:
 *           type: integer
 *           description: ID of the merchant who owns this ad
 *         rate:
 *           type: number
 *           minimum: 0.0001
 *           description: Exchange rate (local currency per token)
 *         minOrder:
 *           type: number
 *           minimum: 0
 *           description: Minimum trade amount in token units
 *         maxOrder:
 *           type: number
 *           minimum: 0
 *           description: Maximum trade amount in token units
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the ad is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Get all advertisements
 *     description: Retrieve all advertisements with filtering and pagination options
 *     tags: [Advertisements]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *           enum: [USDT, USDC, DAI, ETH, BTC]
 *         description: Filter by token type
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [BUY, SELL]
 *           default: SELL
 *         description: Filter by ad type
 *       - in: query
 *         name: minRate
 *         schema:
 *           type: number
 *         description: Minimum exchange rate
 *       - in: query
 *         name: maxRate
 *         schema:
 *           type: number
 *         description: Maximum exchange rate
 *       - in: query
 *         name: localCurrency
 *         schema:
 *           type: string
 *         description: Local currency code
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *         description: Filter by payment method
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and terms
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: updatedAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Advertisements retrieved successfully
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
 *                   example: Advertisements retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ads:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ad'
 *                     pagination:
 *                       type: object
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get("/", adController.getAllAds);

/**
 * @swagger
 * /api/ads/search:
 *   get:
 *     summary: Search advertisements
 *     description: Search advertisements with text query and filters
 *     tags: [Advertisements]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Filter by token
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [BUY, SELL]
 *           default: SELL
 *         description: Filter by ad type
 *       - in: query
 *         name: minRate
 *         schema:
 *           type: number
 *         description: Minimum exchange rate
 *       - in: query
 *         name: maxRate
 *         schema:
 *           type: number
 *         description: Maximum exchange rate
 *       - in: query
 *         name: localCurrency
 *         schema:
 *           type: string
 *           default: NGN
 *         description: Local currency
 *       - in: query
 *         name: paymentMethods
 *         schema:
 *           type: string
 *         description: Comma-separated payment methods
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Invalid search parameters
 *       500:
 *         description: Internal server error
 */
router.get("/search", adController.searchAds);

/**
 * @swagger
 * /api/ads/summary:
 *   get:
 *     summary: Get active ads summary
 *     description: Get summary statistics of active advertisements by token
 *     tags: [Advertisements]
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       token:
 *                         type: string
 *                       activeAds:
 *                         type: integer
 *                       averageRate:
 *                         type: number
 *                       minRate:
 *                         type: number
 *                       maxRate:
 *                         type: number
 *                       totalAvailable:
 *                         type: number
 */
router.get("/summary", async (req, res) => {
  try {
    const adService = require("../services/adService");
    const summary = await adService.getActiveAdsSummary();
    res.json({
      success: true,
      message: "Summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/ads/{adId}:
 *   get:
 *     summary: Get advertisement by ID
 *     description: Retrieve a specific advertisement by its ID
 *     tags: [Advertisements]
 *     parameters:
 *       - in: path
 *         name: adId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Advertisement ID
 *     responses:
 *       200:
 *         description: Advertisement retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ad'
 *       404:
 *         description: Advertisement not found
 *       500:
 *         description: Internal server error
 */
router.get("/:adId", adController.getAdById);

/**
 * @swagger
 * /api/ads/{adId}/stats:
 *   get:
 *     summary: Get advertisement statistics
 *     description: Get detailed statistics for a specific advertisement
 *     tags: [Advertisements]
 *     parameters:
 *       - in: path
 *         name: adId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Advertisement ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       404:
 *         description: Advertisement not found
 *       500:
 *         description: Internal server error
 */
router.get("/:adId/stats", adController.getAdStats);

/**
 * @swagger
 * /api/merchants/{merchantId}/ads:
 *   get:
 *     summary: Get merchant's advertisements
 *     description: Retrieve all advertisements for a specific merchant
 *     tags: [Advertisements]
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Merchant ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Merchant advertisements retrieved successfully
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create new advertisement
 *     description: Create a new advertisement for the specified merchant
 *     tags: [Advertisements]
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Merchant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exchangeRate
 *               - minAmount
 *               - maxAmount
 *               - availableAmount
 *               - paymentMethods
 *             properties:
 *               minOrder:
 *                 type: number
 *                 example: 10.0
 *               maxOrder:
 *                 type: number
 *                 example: 1000.0

 *     responses:
 *       201:
 *         description: Advertisement created successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Merchant not found
 *       500:
 *         description: Internal server error
 */

module.exports = router;
