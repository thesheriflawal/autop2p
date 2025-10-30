#!/usr/bin/env node

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

async function migrateAdTable() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'airp2p_db',
    process.env.DB_USERNAME || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    const queryInterface = sequelize.getQueryInterface();

    // Check if ads table exists
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.some(table => table === 'ads' || table.tableName === 'ads')
    );

    if (!tableExists) {
      console.log('✅ Ads table does not exist. Will be created with new schema.');
      await sequelize.close();
      return;
    }

    console.log('📊 Ads table exists. Migrating to new schema...');

    // Get current table description
    const currentColumns = await queryInterface.describeTable('ads');
    console.log('Current columns:', Object.keys(currentColumns));

    // Start transaction for safe migration
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Add new columns if they don't exist
      if (!currentColumns.rate) {
        console.log('Adding rate column...');
        await queryInterface.addColumn('ads', 'rate', {
          type: DataTypes.DECIMAL(10, 4),
          allowNull: true, // Initially allow null for existing records
        }, { transaction });
      }

      if (!currentColumns.limit) {
        console.log('Adding limit column...');
        await queryInterface.addColumn('ads', 'limit', {
          type: DataTypes.DECIMAL(20, 8),
          allowNull: true, // Initially allow null for existing records
        }, { transaction });
      }

      // Step 2: Migrate data from old columns to new columns (if old columns exist)
      if (currentColumns.exchangeRate) {
        console.log('Migrating exchangeRate to rate...');
        await sequelize.query(
          'UPDATE ads SET rate = "exchangeRate" WHERE rate IS NULL',
          { transaction }
        );
      }

      if (currentColumns.maxAmount) {
        console.log('Migrating maxAmount to limit...');
        await sequelize.query(
          'UPDATE ads SET "limit" = "maxAmount" WHERE "limit" IS NULL',
          { transaction }
        );
      } else if (currentColumns.availableAmount) {
        console.log('Migrating availableAmount to limit...');
        await sequelize.query(
          'UPDATE ads SET "limit" = "availableAmount" WHERE "limit" IS NULL',
        { transaction }
        );
      }

      // Step 3: Set default values for any remaining null values
      await sequelize.query(
        'UPDATE ads SET rate = 1.0 WHERE rate IS NULL',
        { transaction }
      );
      await sequelize.query(
        'UPDATE ads SET "limit" = 100.0 WHERE "limit" IS NULL',
        { transaction }
      );

      // Step 4: Make columns NOT NULL
      if (currentColumns.rate && currentColumns.rate.allowNull !== false) {
        console.log('Making rate column NOT NULL...');
        await queryInterface.changeColumn('ads', 'rate', {
          type: DataTypes.DECIMAL(10, 4),
          allowNull: false,
        }, { transaction });
      }

      if (currentColumns.limit && currentColumns.limit.allowNull !== false) {
        console.log('Making limit column NOT NULL...');
        await queryInterface.changeColumn('ads', 'limit', {
          type: DataTypes.DECIMAL(20, 8),
          allowNull: false,
        }, { transaction });
      }

      // Step 5: Remove old columns that are no longer needed
      const columnsToRemove = [
        'title', 'token', 'type', 'exchangeRate', 'localCurrency',
        'minAmount', 'maxAmount', 'availableAmount', 'paymentMethods',
        'tradingTerms', 'autoReply', 'completedTrades', 'totalVolume',
        'averageRating', 'priceFormula', 'geolocation', 'tags',
        'lastActiveAt', 'expiresAt'
      ];

      for (const column of columnsToRemove) {
        if (currentColumns[column]) {
          console.log(`Removing column: ${column}`);
          await queryInterface.removeColumn('ads', column, { transaction });
        }
      }

      // Step 6: Remove old indexes if they exist
      try {
        const indexes = await queryInterface.showIndex('ads');
        for (const index of indexes) {
          if (index.name && index.name !== 'ads_pkey' && index.name !== 'PRIMARY') {
            console.log(`Removing old index: ${index.name}`);
            await queryInterface.removeIndex('ads', index.name, { transaction });
          }
        }
      } catch (error) {
        console.log('No old indexes to remove or error removing indexes:', error.message);
      }

      await transaction.commit();
      console.log('✅ Migration completed successfully!');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  migrateAdTable().then(() => {
    console.log('✅ Migration script completed.');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = migrateAdTable;