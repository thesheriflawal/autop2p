#!/usr/bin/env node

/**
 * AirP2P Backend Server
 * 
 * Entry point for the AirP2P automated P2P platform backend
 * 
 * Features:
 * - Listens for blockchain deposit events using Viem
 * - Manages merchant rates and balances
 * - Processes payments via external API
 * - RESTful API for frontend integration
 */

const app = require('./src/app');
const logger = require('./src/utils/logger');

// Start the server
app.start()
  .then((server) => {
    logger.info('🎉 AirP2P Backend is ready to process transactions');
  })
  .catch((error) => {
    logger.error('💥 Failed to start AirP2P Backend:', error);
    process.exit(1);
  });