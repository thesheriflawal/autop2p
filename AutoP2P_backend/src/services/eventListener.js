const {
  publicClient,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} = require("../config/blockchain");
const { processDeposit } = require("./depositService");
const logger = require("../utils/logger");
const { parseAbiItem } = require("viem");
const depositService = require("./depositService");

class EventListenerService {
  constructor() {
    this.isListening = false;
    this.lastCheckedBlock = 0;
    this.pollInterval = null;
  }

  async startListening() {
    if (this.isListening) {
      logger.warn("Event listener is already running");
      return;
    }

    const currentBlock = await publicClient.getBlockNumber();
    this.lastCheckedBlock = currentBlock - 1n;

    logger.info("Starting event listener (polling mode)...");

    this.pollInterval = setInterval(() => this.pollEvents(), 8000);
    this.isListening = true;

    // try {
    //   if (!CONTRACT_ADDRESS) {
    //     throw new Error("CONTRACT_ADDRESS not configured");
    //   }

    //   logger.info("Starting event listener for deposit events...");

    //   // Watch for Deposit events
    //   this.unwatch = publicClient.watchEvent({
    //     address: CONTRACT_ADDRESS,
    //     event: parseAbiItem(
    //       "event TradeCreated(\
    //     uint256 indexed tradeId,\
    //     address indexed buyer,\
    //     uint256 indexed merchantId,\
    //     string accountName,\
    //     string accountNumber,\
    //     string bankCode,\
    //     uint256 amount,\
    //     uint256 timestamp\
    // )"
    //     ),
    //     onLogs: this.handleDepositEvent.bind(this),
    //     onError: this.handleError.bind(this),
    //   });

    //   this.isListening = true;
    //   logger.info("✅ Event listener started successfully");
    // } catch (error) {
    //   logger.error("Failed to start event listener:", { error });
    //   throw error;
    // }
  }

  async pollEvents() {
    try {
      const latestBlock = await publicClient.getBlockNumber();

      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem(
          "event TradeCreated(\
        uint256 indexed tradeId,\
        address indexed buyer,\
        uint256 indexed merchantId,\
        string accountName,\
        string accountNumber,\
        string bankCode,\
        uint256 amount,\
         uint256 adId,\
        uint256 timestamp\
    )"
        ),
        fromBlock: latestBlock == this.lastCheckedBlock ? this.lastCheckedBlock : this.lastCheckedBlock + 1n,
        toBlock: latestBlock,
      });

      if (logs.length > 0) {
        logger.info(`🟢 Found ${logs.length} new TradeCreated event(s)`);
        await this.handleDepositEvent(logs);
      }

      this.lastCheckedBlock = latestBlock;
    } catch (error) {
      logger.error("Polling error:", { error });
    }
  }

  async handleDepositEvent(logs) {
    logger.info(`Received ${logs.length} deposit event(s)`);
    // console.log(logs);

    for (const log of logs) {
      logger.info("Processing deposit event log:", { log });
      try {
        const { args, transactionHash, blockNumber } = log;
        const {
          amount,
          accountName,
          accountNumber,
          bankCode,
          buyer,
          merchantId,
          adId,
          timestamp,
          tradeId,
        } = args;

        logger.info("Processing deposit event:", {
          transactionHash,
          blockNumber: blockNumber?.toString(),
          buyer,
          merchantId,
          accountNumber,
          accountName,
          bankCode,
          amount: amount?.toString(),
          timestamp: timestamp?.toString(),
        });

        //     {
        //   fromAddress,
        //   txHash,
        //   amount,
        //   accountNumber,
        //   accountName,
        //   bankCode,
        //   merchantId,
        //   timestamp,
        //   blockNumber
        // }

        // Process the deposit
        await depositService.processPayment({
          tradeId: Number(tradeId),
          txHash: transactionHash,
          buyer,
          merchantId: merchantId.toString(),
          adId: adId?.toString(),
          accountNumber,
          accountName,
          bankCode,
          amount: amount?.toString(),
          blockNumber: blockNumber?.toString(),
          timestamp: timestamp?.toString(),
        });

        logger.info(`✅ Deposit processed successfully: ${transactionHash}`);
      } catch (error) {
        logger.error("Error processing deposit event:", {
          error: error.message,
          log,
        });
      }
    }
  }

  handleError(error) {
    logger.error("Event listener error:", { error });

    // Attempt to restart the listener after a delay
    if (this.isListening) {
      logger.info("Attempting to restart event listener in 10 seconds...");
      setTimeout(() => {
        this.stopListening();
        this.startListening();
      }, 10000);
    }
  }

  stopListening() {
    if (this.unwatch) {
      this.unwatch();
      this.unwatch = null;
    }
    this.isListening = false;
    logger.info("Event listener stopped");
  }

  getStatus() {
    return {
      isListening: this.isListening,
      contractAddress: CONTRACT_ADDRESS,
    };
  }
}

module.exports = new EventListenerService();
