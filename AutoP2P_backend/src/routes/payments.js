const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Bank:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique bank identifier
 *         name:
 *           type: string
 *           description: Bank name
 *         code:
 *           type: string
 *           description: Bank code for transfers
 *         type:
 *           type: string
 *           description: Bank type
 *         country:
 *           type: string
 *           description: Country code
 *       example:
 *         id: "1"
 *         name: "Access Bank"
 *         code: "044"
 *         type: "commercial"
 *         country: "NG"
 *     
 *     PaymentConfig:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *           description: Whether payment configuration is valid
 *         issues:
 *           type: array
 *           items:
 *             type: string
 *           description: Configuration issues if any
 *         mode:
 *           type: string
 *           enum: [mock, production]
 *           description: Current payment mode
 *       example:
 *         isValid: true
 *         issues: []
 *         mode: "production"
 */

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment system endpoints for bank operations
 */

/**
 * @swagger
 * /api/payments/banks:
 *   get:
 *     summary: Get all supported banks
 *     description: Retrieve list of all supported banks with their codes for money transfers
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Banks retrieved successfully
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
 *                   example: "Bank codes retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bank'
 *                 count:
 *                   type: integer
 *                   example: 50
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve bank codes"
 *                 error:
 *                   type: string
 *                   example: "Network timeout"
 */
router.get('/banks', paymentController.getBankCodes);

/**
 * @swagger
 * /api/payments/banks/search:
 *   get:
 *     summary: Search banks by name
 *     description: Search for banks by partial name match
 *     tags: [Payments]
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank name to search for
 *         example: "access"
 *     responses:
 *       200:
 *         description: Search results returned successfully
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
 *                   example: "Found 2 banks matching 'access'"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bank'
 *                 count:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Search name parameter is required"
 *       500:
 *         description: Internal server error
 */
router.get('/banks/search', paymentController.searchBanks);

/**
 * @swagger
 * /api/payments/banks/{bankCode}:
 *   get:
 *     summary: Get bank details by code
 *     description: Retrieve specific bank information using bank code
 *     tags: [Payments]
 *     parameters:
 *       - name: bankCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank code
 *         example: "044"
 *     responses:
 *       200:
 *         description: Bank details retrieved successfully
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
 *                   example: "Bank details retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Bank'
 *       400:
 *         description: Invalid bank code parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Bank code is required"
 *       404:
 *         description: Bank not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Bank with code '999' not found"
 *       500:
 *         description: Internal server error
 */
router.get('/banks/:bankCode', paymentController.getBankByCode);

/**
 * @swagger
 * /api/payments/config:
 *   get:
 *     summary: Get payment configuration status
 *     description: Check payment system configuration and operational status
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Configuration status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PaymentConfig'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve payment configuration"
 *                 error:
 *                   type: string
 */
router.get('/config', paymentController.getPaymentConfig);

module.exports = router;