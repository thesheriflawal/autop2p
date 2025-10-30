const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Merchant = sequelize.define('Merchant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEthereumAddress(value) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          throw new Error('Invalid Ethereum address');
        }
      },
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  adRate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 1.0000,
    comment: 'Rate multiplier for deposits (e.g., 1.05 for 5% premium)',
  },
  balance: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    allowNull: false,
    comment: 'Current merchant balance in wei/smallest unit',
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ETH',
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  minOrder: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    comment: 'Minimum order amount',
  },
  maxOrder: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    comment: 'Maximum order amount',
  },
  paymentMethods: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of supported payment methods',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Merchant;