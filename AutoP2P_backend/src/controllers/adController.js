const adService = require('../services/adService');
const logger = require('../utils/logger');

class AdController {
  /**
   * Create a new advertisement
   */
  async createAd(req, res) {
    try {
      const { merchantId } = req.params;
      const adData = req.body;

      // Validate required fields
      const requiredFields = ['rate', 'minOrder', 'maxOrder'];
      const missingFields = requiredFields.filter(field => !adData[field] && adData[field] !== 0);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          requiredFields,
        });
      }

      // Add merchantId to ad data
      adData.merchantId = parseInt(merchantId);

      const ad = await adService.createAd(adData);

      res.status(201).json({
        success: true,
        message: 'Advertisement created successfully',
        data: ad,
      });
    } catch (error) {
      logger.error('Error creating ad:', { error: error.message, merchantId: req.params.merchantId });
      
      let status = 500;
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        status = 404;
      } else if (error.message.includes('validation') || error.message.includes('Invalid') || error.message.includes('must be')) {
        status = 400;
      }

      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all advertisements with filtering and pagination
   */
  async getAllAds(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        minRate,
        maxRate,
        minOrder,
        maxOrder,
        isActive = 'true',
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        merchantId,
      } = req.query;

      // Validate query parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Page must be greater than 0',
        });
      }

      if (limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100',
        });
      }

      const filters = {
        page: pageNum,
        limit: limitNum,
        minRate: minRate ? parseFloat(minRate) : null,
        maxRate: maxRate ? parseFloat(maxRate) : null,
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxOrder: maxOrder ? parseFloat(maxOrder) : null,
        isActive: isActive === 'true',
        sortBy,
        sortOrder,
        merchantId: merchantId ? parseInt(merchantId) : null,
      };

      const result = await adService.getAllAds(filters);

      res.json({
        success: true,
        message: 'Advertisements retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error getting all ads:', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get a specific advertisement by ID
   */
  async getAdById(req, res) {
    try {
      const { adId } = req.params;

      if (!adId || isNaN(parseInt(adId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid ad ID is required',
        });
      }

      const ad = await adService.getAdById(parseInt(adId));

      res.json({
        success: true,
        message: 'Advertisement retrieved successfully',
        data: ad,
      });
    } catch (error) {
      logger.error('Error getting ad by ID:', { error: error.message, adId: req.params.adId });
      
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all advertisements by a specific merchant
   */
  async getMerchantAds(req, res) {
    try {
      const { merchantId } = req.params;
      const {
        page = 1,
        limit = 20,
        isActive,
        sortBy = 'updatedAt',
        sortOrder = 'DESC',
      } = req.query;

      if (!merchantId || isNaN(parseInt(merchantId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid merchant ID is required',
        });
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters',
        });
      }

      const filters = {
        page: pageNum,
        limit: limitNum,
        isActive: isActive !== undefined ? isActive === 'true' : null,
        sortBy,
        sortOrder,
      };

      const result = await adService.getMerchantAds(parseInt(merchantId), filters);

      res.json({
        success: true,
        message: 'Merchant advertisements retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error getting merchant ads:', { error: error.message, merchantId: req.params.merchantId });
      
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update an existing advertisement
   */
  async updateAd(req, res) {
    try {
      const { merchantId, adId } = req.params;
      const updateData = req.body;

      if (!merchantId || isNaN(parseInt(merchantId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid merchant ID is required',
        });
      }

      if (!adId || isNaN(parseInt(adId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid ad ID is required',
        });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No update data provided',
        });
      }

      const updatedAd = await adService.updateAd(parseInt(adId), parseInt(merchantId), updateData);

      res.json({
        success: true,
        message: 'Advertisement updated successfully',
        data: updatedAd,
      });
    } catch (error) {
      logger.error('Error updating ad:', { 
        error: error.message, 
        merchantId: req.params.merchantId, 
        adId: req.params.adId 
      });

      let status = 500;
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        status = 404;
      } else if (error.message.includes('not authorized') || error.message.includes('permission')) {
        status = 403;
      } else if (error.message.includes('validation') || error.message.includes('Invalid') || error.message.includes('must be')) {
        status = 400;
      }

      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete an advertisement
   */
  async deleteAd(req, res) {
    try {
      const { merchantId, adId } = req.params;

      if (!merchantId || isNaN(parseInt(merchantId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid merchant ID is required',
        });
      }

      if (!adId || isNaN(parseInt(adId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid ad ID is required',
        });
      }

      await adService.deleteAd(parseInt(adId), parseInt(merchantId));

      res.json({
        success: true,
        message: 'Advertisement deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting ad:', { 
        error: error.message, 
        merchantId: req.params.merchantId, 
        adId: req.params.adId 
      });

      let status = 500;
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        status = 404;
      } else if (error.message.includes('not authorized') || error.message.includes('permission')) {
        status = 403;
      }

      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Toggle advertisement active status
   */
  async toggleAdStatus(req, res) {
    try {
      const { merchantId, adId } = req.params;
      const { isActive } = req.body;

      if (!merchantId || isNaN(parseInt(merchantId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid merchant ID is required',
        });
      }

      if (!adId || isNaN(parseInt(adId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid ad ID is required',
        });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value',
        });
      }

      const updatedAd = await adService.toggleAdStatus(parseInt(adId), parseInt(merchantId), isActive);

      res.json({
        success: true,
        message: `Advertisement ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedAd,
      });
    } catch (error) {
      logger.error('Error toggling ad status:', { 
        error: error.message, 
        merchantId: req.params.merchantId, 
        adId: req.params.adId 
      });

      let status = 500;
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        status = 404;
      } else if (error.message.includes('not authorized') || error.message.includes('permission')) {
        status = 403;
      }

      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get advertisement statistics
   */
  async getAdStats(req, res) {
    try {
      const { adId } = req.params;

      if (!adId || isNaN(parseInt(adId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid ad ID is required',
        });
      }

      const stats = await adService.getAdStats(parseInt(adId));

      res.json({
        success: true,
        message: 'Advertisement statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting ad stats:', { error: error.message, adId: req.params.adId });
      
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Search advertisements
   */
  async searchAds(req, res) {
    try {
      const {
        minRate,
        maxRate,
        minOrder,
        maxOrder,
        page = 1,
        limit = 20,
        merchantId,
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters',
        });
      }

      const searchParams = {
        minRate: minRate ? parseFloat(minRate) : null,
        maxRate: maxRate ? parseFloat(maxRate) : null,
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxOrder: maxOrder ? parseFloat(maxOrder) : null,
        page: pageNum,
        limit: limitNum,
        merchantId: merchantId ? parseInt(merchantId) : null,
      };

      const result = await adService.searchAds(searchParams);

      res.json({
        success: true,
        message: 'Search completed successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error searching ads:', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AdController();