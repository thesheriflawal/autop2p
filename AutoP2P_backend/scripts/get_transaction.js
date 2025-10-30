#!/usr/bin/env node
require('dotenv').config();
// const Merchant = require('../models/Merchant');
const { Sequelize } = require('sequelize');
const { Transaction } = require('../src/models');


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


  Transaction.findAll().then(transactions => {
          console.log("All transactions:", JSON.stringify(transactions, null, 2));
      });