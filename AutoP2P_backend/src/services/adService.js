const { Op } = require('sequelize');
const Ad = require('../models/Ad');
const Merchant = require('../models/Merchant');
const logger = require('../utils/logger');

class AdService {
  /**
   * Create a new advertisement
   */
  async createAd(adData) {
    try {
      // Verify merchant exists
      const merchant = await Merchant.findByPk(adData.merchantId);
      if (!merchant) {
        throw new Error('Merchant not found');
      }

      // Validate business rules
      if (!adData.rate || adData.rate <= 0) {
        throw new Error('Rate must be a positive number');
      }

      if (!adData.minOrder || adData.minOrder <= 0) {
        throw new Error('Minimum order must be a positive number');
      }

      if (!adData.maxOrder || adData.maxOrder <= 0) {
        throw new Error('Maximum order must be a positive number');
      }

      if (adData.minOrder >= adData.maxOrder) {
        throw new Error('Minimum order must be less than maximum order');
      }

      // Create the ad
      const ad = await Ad.create(adData);
      
      // Return ad with merchant information
      return await this.getAdById(ad.id);
    } catch (error) {
      logger.error('AdService - Create ad error:', { error: error.message, adData });
      throw error;
    }
  }

  /**
   * Get all advertisements with filtering and pagination
   */
  async getAllAds(filters) {
    try {
      const {
        page,
        limit,
        minRate,
        maxRate,
        minOrder,
        maxOrder,
        isActive,
        sortBy,
        sortOrder,
        merchantId,
      } = filters;

      // Build where conditions
      const whereConditions = {};

      if (minRate !== null || maxRate !== null) {
        whereConditions.rate = {};
        if (minRate !== null) {
          whereConditions.rate[Op.gte] = minRate;
        }
        if (maxRate !== null) {
          whereConditions.rate[Op.lte] = maxRate;
        }
      }

      if (minOrder !== null || maxOrder !== null) {
        if (minOrder !== null) {
          whereConditions.maxOrder = { [Op.gte]: minOrder };
        }
        if (maxOrder !== null) {
          whereConditions.minOrder = { [Op.lte]: maxOrder };
        }
      }

      if (typeof isActive === 'boolean') {
        whereConditions.isActive = isActive;
      }

      if (merchantId) {
        whereConditions.merchantId = merchantId;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Ad.findAndCountAll({
        where: whereConditions,
        include: [{
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'name', 'walletAddress', 'isActive'],
        }],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit,
        offset,
        distinct: true,
      });

      return {
        ads: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1,
        },
        filters: filters,
      };
    } catch (error) {
      logger.error('AdService - Get all ads error:', { error: error.message, filters });
      throw error;
    }
  }

  /**
   * Get advertisement by ID
   */
  async getAdById(adId) {
    try {
      const ad = await Ad.findByPk(adId, {
        include: [{
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'name', 'walletAddress', 'email', 'isActive', 'createdAt'],
        }],
      });

      if (!ad) {
        throw new Error('Advertisement not found');
      }

      return ad;
    } catch (error) {
      logger.error('AdService - Get ad by ID error:', { error: error.message, adId });
      throw error;
    }
  }

  /**
   * Get advertisements by merchant
   */
  async getMerchantAds(merchantId, filters) {
    try {
      // Verify merchant exists
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        throw new Error('Merchant not found');
      }

      const { page, limit, isActive, sortBy, sortOrder } = filters;

      const whereConditions = { merchantId };

      if (typeof isActive === 'boolean') {
        whereConditions.isActive = isActive;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Ad.findAndCountAll({
        where: whereConditions,
        include: [{
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'name', 'walletAddress', 'isActive'],
        }],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit,
        offset,
      });

      return {
        ads: rows,
        merchant: {
          id: merchant.id,
          name: merchant.name,
          walletAddress: merchant.walletAddress,
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('AdService - Get merchant ads error:', { error: error.message, merchantId, filters });
      throw error;
    }
  }

  /**
   * Update advertisement
   */
  async updateAd(adId, merchantId, updateData) {
    try {
      const ad = await Ad.findOne({
        where: { id: adId, merchantId },
      });

      if (!ad) {
        throw new Error('Advertisement not found or you do not have permission to update it');
      }

      // Validate update data
      if (updateData.rate !== undefined && updateData.rate <= 0) {
        throw new Error('Rate must be a positive number');
      }

      if (updateData.minOrder !== undefined && updateData.minOrder <= 0) {
        throw new Error('Minimum order must be a positive number');
      }

      if (updateData.maxOrder !== undefined && updateData.maxOrder <= 0) {
        throw new Error('Maximum order must be a positive number');
      }

      // Validate order range
      const currentMinOrder = updateData.minOrder !== undefined ? updateData.minOrder : ad.minOrder;
      const currentMaxOrder = updateData.maxOrder !== undefined ? updateData.maxOrder : ad.maxOrder;
      
      if (currentMinOrder >= currentMaxOrder) {
        throw new Error('Minimum order must be less than maximum order');
      }

      // Update the ad
      await ad.update(updateData);

      // Return updated ad with merchant info
      return await this.getAdById(adId);
    } catch (error) {
      logger.error('AdService - Update ad error:', { error: error.message, adId, merchantId, updateData });
      throw error;
    }
  }

  /**
   * Delete advertisement
   */
  async deleteAd(adId, merchantId) {
    try {
      const ad = await Ad.findOne({
        where: { id: adId, merchantId },
      });

      if (!ad) {
        throw new Error('Advertisement not found or you do not have permission to delete it');
      }

      await ad.destroy();
      
      logger.info('AdService - Ad deleted:', { adId, merchantId });
    } catch (error) {
      logger.error('AdService - Delete ad error:', { error: error.message, adId, merchantId });
      throw error;
    }
  }

  /**
   * Toggle advertisement active status
   */
  async toggleAdStatus(adId, merchantId, isActive) {
    try {
      const ad = await Ad.findOne({
        where: { id: adId, merchantId },
      });

      if (!ad) {
        throw new Error('Advertisement not found or you do not have permission to modify it');
      }

      await ad.update({ isActive });

      logger.info('AdService - Ad status toggled:', { adId, merchantId, isActive });

      return await this.getAdById(adId);
    } catch (error) {
      logger.error('AdService - Toggle ad status error:', { error: error.message, adId, merchantId, isActive });
      throw error;
    }
  }

  /**
   * Get advertisement statistics
   */
  async getAdStats(adId) {
    try {
      const ad = await Ad.findByPk(adId);

      if (!ad) {
        throw new Error('Advertisement not found');
      }

      // Calculate basic stats
      const daysSinceCreated = Math.floor((new Date() - ad.createdAt) / (1000 * 60 * 60 * 24));

      const stats = {
        id: ad.id,
        isActive: ad.isActive,
        rate: parseFloat(ad.rate),
        minOrder: parseFloat(ad.minOrder),
        maxOrder: parseFloat(ad.maxOrder),
        daysSinceCreated,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
      };

      return stats;
    } catch (error) {
      logger.error('AdService - Get ad stats error:', { error: error.message, adId });
      throw error;
    }
  }

  /**
   * Search advertisements
   */
  async searchAds(searchParams) {
    try {
      const {
        minRate,
        maxRate,
        minOrder,
        maxOrder,
        page,
        limit,
        merchantId,
      } = searchParams;

      const whereConditions = {
        isActive: true,
      };

      // Rate filters
      if (minRate !== null || maxRate !== null) {
        whereConditions.rate = {};
        if (minRate !== null) {
          whereConditions.rate[Op.gte] = minRate;
        }
        if (maxRate !== null) {
          whereConditions.rate[Op.lte] = maxRate;
        }
      }

      // Order filters
      if (minOrder !== null || maxOrder !== null) {
        if (minOrder !== null) {
          whereConditions.maxOrder = { [Op.gte]: minOrder };
        }
        if (maxOrder !== null) {
          whereConditions.minOrder = { [Op.lte]: maxOrder };
        }
      }

      if (merchantId) {
        whereConditions.merchantId = merchantId;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Ad.findAndCountAll({
        where: whereConditions,
        include: [{
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'name', 'walletAddress', 'isActive'],
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      return {
        results: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('AdService - Search ads error:', { error: error.message, searchParams });
      throw error;
    }
  }


  /**
   * Get active ads summary
   */
  async getActiveAdsSummary() {
    try {
      const summary = await Ad.findAll({
        attributes: [
          [Ad.sequelize.fn('COUNT', Ad.sequelize.col('id')), 'count'],
          [Ad.sequelize.fn('AVG', Ad.sequelize.col('rate')), 'avgRate'],
          [Ad.sequelize.fn('MIN', Ad.sequelize.col('rate')), 'minRate'],
          [Ad.sequelize.fn('MAX', Ad.sequelize.col('rate')), 'maxRate'],
          [Ad.sequelize.fn('AVG', Ad.sequelize.col('minOrder')), 'avgMinOrder'],
          [Ad.sequelize.fn('AVG', Ad.sequelize.col('maxOrder')), 'avgMaxOrder'],
        ],
        where: {
          isActive: true,
        },
      });

      const result = summary[0];
      return {
        activeAds: parseInt(result.dataValues.count || 0),
        averageRate: parseFloat(result.dataValues.avgRate || 0),
        minRate: parseFloat(result.dataValues.minRate || 0),
        maxRate: parseFloat(result.dataValues.maxRate || 0),
        avgMinOrder: parseFloat(result.dataValues.avgMinOrder || 0),
        avgMaxOrder: parseFloat(result.dataValues.avgMaxOrder || 0),
      };
    } catch (error) {
      logger.error('AdService - Get active ads summary error:', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AdService();