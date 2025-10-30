import { walletClient } from "../config/blockchain";

class CompleteTradeService {
    /**
     * Complete a trade by sending payment on-chain
     *  @param {Object} trade - Trade details
     *  @returns {Promise<Object>} Transaction result
     */
    async completeTradeOnChain(trade) {
        const {
            tradeId,
            merchant,
            amount,
            accountNumber,
            accountName,
            bankCode,
        } = trade;

        try {
            logger.info('Completing trade on-chain:', { tradeId, merchantId: merchant.id });

            // Prepare transaction data
            const txData = {
                to: merchant.walletAddress,
                value: BigInt(amount),
                data: encodePaymentData({
                    accountNumber,
                    accountName,
                    bankCode,
                    tradeId,
                }),
            };

            // Send transaction
            const txHash = await walletClient.sendTransaction(txData);

            logger.info('Trade completed on-chain:', { tradeId, txHash });

            return { success: true, txHash };
        } catch (error) {
            logger.error('Failed to complete trade on-chain:', { tradeId, error });
            throw error;
        }
    }
}

module.exports = new CompleteTradeService();