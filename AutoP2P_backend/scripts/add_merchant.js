#!/usr/bin/env node
require('dotenv').config();
// const Merchant = require('../models/Merchant');
const { Sequelize } = require('sequelize');
const { Merchant } = require('../src/models');


 const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'airp2p_db',
  };



const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    }
  );

async function addMerchant() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Example merchant data
    // const newMerchant = await Merchant.create({
    //   walletAddress: '0xA1b2C3D4e5F678901234567890abcdef12345678'.toLowerCase(),
    //   name: 'Test Merchant',
    //   email: 'merchant@example.com',
    //   adRate: 1.0500,
    //   balance: 1000000.00000000,
    //   currency: 'ETH',
    //   isActive: true,
    //   minOrder: 0.01,
    //   maxOrder: 10.0,
    //   paymentMethods: [
    //     {
    //       bankName: 'Access Bank',
    //       accountName: 'Test Merchant Ltd',
    //       accountNumber: '1234567890',
    //       bankCode: '044',
    //     },
    //     {
    //       bankName: 'GTBank',
    //       accountName: 'Test Merchant Ltd',
    //       accountNumber: '0987654321',
    //       bankCode: '058',
    //     }
    //   ],
    // });

    Merchant.findAll().then(merchants => {
        console.log("All merchants:", JSON.stringify(merchants, null, 2));
    });


    // delete all merchants
    // await Merchant.destroy({ where: {}, truncate: false });
    // console.log('All merchants deleted.');

    console.log('\n🎉 Merchant added successfully!');
    console.log(newMerchant.toJSON());
  } catch (error) {
    console.error('❌ Error adding merchant:', error.message);
  } finally {
    await sequelize.close();
  }
}

addMerchant();
