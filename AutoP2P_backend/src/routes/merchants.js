const express = require('express');
const merchantController = require('../controllers/merchantController');
const adController = require('../controllers/adController');

const router = express.Router();

/**
 * @swagger
 * /api/merchants:
 *   get:
 *     summary: Get all merchants with pagination and filtering
 *     description: Retrieve a paginated list of all active merchants with optional filtering and sorting
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Currency'
 *       - $ref: '#/components/parameters/MinRate'
 *       - $ref: '#/components/parameters/MaxRate'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *       - $ref: '#/components/parameters/Search'
 *       - $ref: '#/components/parameters/HasBalance'
 *     responses:
 *       200:
 *         description: Merchants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedMerchantsResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', merchantController.getAllMerchants);

/**
 * @swagger
 * /api/merchants:
 *   post:
 *     summary: Create a new merchant
 *     description: Register a new merchant on the platform
 *     tags: [Merchants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MerchantCreateRequest'
 *     responses:
 *       201:
 *         description: Merchant created successfully
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
 *                   example: 'Merchant created successfully'
 *                 data:
 *                   $ref: '#/components/schemas/Merchant'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', merchantController.createMerchant);

/**
 * @swagger
 * /api/merchants/{walletAddress}:
 *   get:
 *     summary: Get merchant by wallet address
 *     description: Retrieve detailed information about a specific merchant
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/WalletAddress'
 *     responses:
 *       200:
 *         description: Merchant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Merchant'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:walletAddress', merchantController.getMerchant);

/**
 * @swagger
 * /api/merchants/{walletAddress}/rate:
 *   get:
 *     summary: Get merchant's current ad rate
 *     description: Retrieve the current ad rate for a specific merchant
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/WalletAddress'
 *     responses:
 *       200:
 *         description: Merchant rate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     walletAddress:
 *                       type: string
 *                       example: '0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1'
 *                     adRate:
 *                       type: number
 *                       example: 1.05
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:walletAddress/rate', merchantController.getMerchantRate);

/**
 * @swagger
 * /api/merchants/{merchantId}/rate:
 *   put:
 *     summary: Update merchant ad rate (Legacy)
 *     description: Update only the ad rate for a specific merchant. Use /profile endpoint for comprehensive updates.
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 exclusiveMinimum: true
 *                 description: 'Ad rate multiplier'
 *                 example: 1.05
 *             required:
 *               - adRate
 *     responses:
 *       200:
 *         description: Ad rate updated successfully
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
 *                   example: 'Ad rate updated successfully'
 *                 data:
 *                   $ref: '#/components/schemas/Merchant'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:merchantId/rate', merchantController.updateAdRate);

/**
 * @swagger
 * /api/merchants/{merchantId}/profile:
 *   put:
 *     summary: Update merchant profile by ID
 *     description: Update comprehensive merchant profile information including name, email, rates, and payment methods
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MerchantUpdateRequest'
 *     responses:
 *       200:
 *         description: Merchant profile updated successfully
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
 *                   example: 'Merchant profile updated successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchant:
 *                       $ref: '#/components/schemas/Merchant'
 *                     updatedFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ['name', 'email', 'adRate']
 *       400:
 *         description: Bad request - validation error or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:merchantId/profile', merchantController.updateMerchantProfile);

/**
 * @swagger
 * /api/merchants/wallet/{walletAddress}/profile:
 *   put:
 *     summary: Update merchant profile by wallet address
 *     description: Update comprehensive merchant profile information using wallet address as identifier
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/WalletAddress'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MerchantUpdateRequest'
 *     responses:
 *       200:
 *         description: Merchant profile updated successfully
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
 *                   example: 'Merchant profile updated successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchant:
 *                       $ref: '#/components/schemas/Merchant'
 *                     updatedFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ['name', 'email', 'adRate']
 *       400:
 *         description: Bad request - validation error or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/wallet/:walletAddress/profile', merchantController.updateMerchantProfileByWallet);

/**
 * @swagger
 * /api/merchants/{merchantId}/stats:
 *   get:
 *     summary: Get merchant statistics
 *     description: Retrieve comprehensive statistics for a specific merchant including transaction history and performance metrics
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantId'
 *     responses:
 *       200:
 *         description: Merchant statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchant:
 *                       $ref: '#/components/schemas/Merchant'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalTransactions:
 *                           type: integer
 *                           example: 50
 *                         totalVolume:
 *                           type: number
 *                           example: 10000.50
 *                         totalCalculatedVolume:
 *                           type: number
 *                           example: 10500.75
 *                         averageRate:
 *                           type: number
 *                           example: 1.05
 *                         currentBalance:
 *                           type: number
 *                           example: 1000.50
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:merchantId/stats', merchantController.getMerchantStats);

/**
 * @swagger
 * /api/merchants/{merchantId}/transactions:
 *   get:
 *     summary: Get merchant transactions
 *     description: Retrieve paginated transaction history for a specific merchant
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantId'
 *       - name: limit
 *         in: query
 *         description: Number of transactions per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         example: 50
 *       - name: offset
 *         in: query
 *         description: Number of transactions to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         example: 0
 *       - name: status
 *         in: query
 *         description: Filter by transaction status
 *         schema:
 *           type: string
 *         example: 'completed'
 *     responses:
 *       200:
 *         description: Merchant transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         offset:
 *                           type: integer
 *                           example: 0
 *                         total:
 *                           type: integer
 *                           example: 25
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:merchantId/transactions', merchantController.getMerchantTransactions);

/**
 * @swagger
 * /api/merchants/{merchantId}/withdrawal:
 *   post:
 *     summary: Process merchant withdrawal
 *     description: Process a withdrawal request for a merchant to transfer funds to their bank account
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 10
 *                 description: 'Amount to withdraw (minimum 10)'
 *                 example: 500.50
 *               bankName:
 *                 type: string
 *                 minLength: 2
 *                 description: 'Name of the recipient bank'
 *                 example: 'First Bank of Nigeria'
 *               accountNumber:
 *                 type: string
 *                 minLength: 10
 *                 description: 'Bank account number'
 *                 example: '1234567890'
 *               accountName:
 *                 type: string
 *                 minLength: 2
 *                 description: 'Bank account holder name'
 *                 example: 'John Doe Enterprises'
 *               narration:
 *                 type: string
 *                 description: 'Optional withdrawal narration'
 *                 example: 'Monthly withdrawal - John Doe'
 *             required:
 *               - amount
 *               - bankName
 *               - accountNumber
 *               - accountName
 *     responses:
 *       201:
 *         description: Withdrawal request processed successfully
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
 *                   example: 'Withdrawal request processed successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawalRef:
 *                       type: string
 *                       example: 'WD_123_1634567890123'
 *                     amount:
 *                       type: number
 *                       example: 500.50
 *                     previousBalance:
 *                       type: number
 *                       example: 1000.00
 *                     newBalance:
 *                       type: number
 *                       example: 499.50
 *                     status:
 *                       type: string
 *                       example: 'pending'
 *                     estimatedProcessingTime:
 *                       type: string
 *                       example: '1-3 business days'
 *       400:
 *         description: Bad request - validation error or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:merchantId/withdrawal', merchantController.processWithdrawal);

/**
 * @swagger
 * /api/merchants/{merchantId}/withdrawal/eligibility:
 *   get:
 *     summary: Check withdrawal eligibility
 *     description: Check if a merchant is eligible for withdrawal and validate the requested amount
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantId'
 *       - name: amount
 *         in: query
 *         required: true
 *         description: Amount to check for withdrawal eligibility
 *         schema:
 *           type: number
 *           minimum: 0.01
 *         example: 500.50
 *     responses:
 *       200:
 *         description: Eligibility check completed
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
 *                   example: 'Withdrawal eligibility checked'
 *                 data:
 *                   type: object
 *                   properties:
 *                     eligible:
 *                       type: boolean
 *                       example: true
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     currentBalance:
 *                       type: number
 *                       example: 1000.00
 *                     requestedAmount:
 *                       type: number
 *                       example: 500.50
 *                     minimumWithdrawal:
 *                       type: number
 *                       example: 10
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:merchantId/withdrawal/eligibility', merchantController.checkWithdrawalEligibility);

/**
 * @swagger
 * /api/merchants/{merchantId}/withdrawal/history:
 *   get:
 *     summary: Get merchant withdrawal history
 *     description: Retrieve paginated withdrawal history for a specific merchant
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantId'
 *       - $ref: '#/components/parameters/Page'
 *       - name: limit
 *         in: query
 *         description: Number of withdrawals per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *       - name: status
 *         in: query
 *         description: Filter by withdrawal status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         example: 'pending'
 *       - name: startDate
 *         in: query
 *         description: Filter withdrawals from this date (ISO format)
 *         schema:
 *           type: string
 *           format: date
 *         example: '2023-01-01'
 *       - name: endDate
 *         in: query
 *         description: Filter withdrawals up to this date (ISO format)
 *         schema:
 *           type: string
 *           format: date
 *         example: '2023-12-31'
 *     responses:
 *       200:
 *         description: Withdrawal history retrieved successfully
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
 *                   example: 'Withdrawal history retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     withdrawals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           withdrawalRef:
 *                             type: string
 *                             example: 'WD_123_1634567890123'
 *                           amount:
 *                             type: number
 *                             example: 500.50
 *                           status:
 *                             type: string
 *                             example: 'pending'
 *                           bankName:
 *                             type: string
 *                             example: 'First Bank of Nigeria'
 *                           accountNumber:
 *                             type: string
 *                             example: '****567890'
 *                           accountName:
 *                             type: string
 *                             example: 'John Doe Enterprises'
 *                           requestedAt:
 *                             type: string
 *                             format: date-time
 *                             example: '2023-10-18T14:30:00Z'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalItems:
 *                           type: integer
 *                           example: 5
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalWithdrawn:
 *                           type: number
 *                           example: 2500.00
 *                         pendingWithdrawals:
 *                           type: number
 *                           example: 500.50
 *                         completedWithdrawals:
 *                           type: number
 *                           example: 2000.00
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:merchantId/withdrawal/history', merchantController.getWithdrawalHistory);

/**
 * @swagger
 * /api/merchants/{merchantId}/withdrawal/{withdrawalId}:
 *   get:
 *     summary: Get withdrawal details by ID
 *     description: Retrieve detailed information about a specific withdrawal
 *     tags: [Merchants]
 *     parameters:
 *       - $ref: '#/components/parameters/MerchantId'
 *       - name: withdrawalId
 *         in: path
 *         required: true
 *         description: Unique withdrawal ID
 *         schema:
 *           type: string
 *         example: '123'
 *     responses:
 *       200:
 *         description: Withdrawal details retrieved successfully
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
 *                   example: 'Withdrawal retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     withdrawalRef:
 *                       type: string
 *                       example: 'WD_123_1634567890123'
 *                     amount:
 *                       type: number
 *                       example: 500.50
 *                     status:
 *                       type: string
 *                       example: 'pending'
 *                     bankName:
 *                       type: string
 *                       example: 'First Bank of Nigeria'
 *                     accountNumber:
 *                       type: string
 *                       example: '****567890'
 *                     accountName:
 *                       type: string
 *                       example: 'John Doe Enterprises'
 *                     requestedAt:
 *                       type: string
 *                       format: date-time
 *                       example: '2023-10-18T14:30:00Z'
 *                     processedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     merchant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         name:
 *                           type: string
 *                           example: 'John Doe Enterprises'
 *                         email:
 *                           type: string
 *                           example: 'john@example.com'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:merchantId/withdrawal/:withdrawalId', merchantController.getWithdrawalById);

// Advertisement routes for merchants
/**
 * @swagger
 * /api/merchants/{merchantId}/ads:
 *   get:
 *     summary: Get merchant's advertisements
 *     description: Retrieve all advertisements for a specific merchant
 *     tags: [Advertisements]
 *     parameters:
 *       - name: merchantId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Merchant ID
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - name: isActive
 *         in: query
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
 *       - name: merchantId
 *         in: path
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
 *               - rate
 *               - limit
 *             properties:
 *               rate:
 *                 type: number
 *                 example: 1650.00
 *                 description: Exchange rate for the trade
 *               limit:
 *                 type: number
 *                 example: 1000.0
 *                 description: Trade limit amount
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
router.get('/:merchantId/ads', adController.getMerchantAds);
router.post('/:merchantId/ads', adController.createAd);

/**
 * @swagger
 * /api/merchants/{merchantId}/ads/{adId}:
 *   put:
 *     summary: Update advertisement
 *     description: Update an existing advertisement (merchant must own the ad)
 *     tags: [Advertisements]
 *     parameters:
 *       - name: merchantId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Merchant ID
 *       - name: adId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Advertisement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rate:
 *                 type: number
 *                 description: Exchange rate for the trade
 *               limit:
 *                 type: number
 *                 description: Trade limit amount
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Advertisement updated successfully
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Advertisement not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete advertisement
 *     description: Delete an advertisement (merchant must own the ad)
 *     tags: [Advertisements]
 *     parameters:
 *       - name: merchantId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Merchant ID
 *       - name: adId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Advertisement ID
 *     responses:
 *       200:
 *         description: Advertisement deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Advertisement not found
 *       500:
 *         description: Internal server error
 */
router.put('/:merchantId/ads/:adId', adController.updateAd);
router.delete('/:merchantId/ads/:adId', adController.deleteAd);

/**
 * @swagger
 * /api/merchants/{merchantId}/ads/{adId}/toggle:
 *   patch:
 *     summary: Toggle advertisement status
 *     description: Activate or deactivate an advertisement
 *     tags: [Advertisements]
 *     parameters:
 *       - name: merchantId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Merchant ID
 *       - name: adId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Advertisement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: New active status
 *     responses:
 *       200:
 *         description: Status toggled successfully
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Advertisement not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:merchantId/ads/:adId/toggle', adController.toggleAdStatus);

module.exports = router;
