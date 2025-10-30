const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tradeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Blockchain transaction hash',
  },
  fromAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEthereumAddress(value) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          throw new Error('Invalid Ethereum address');
        }
      },
    },
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Merchants',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Original deposit amount in wei/smallest unit',
  },
  calculatedAmount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Amount after applying merchant rate',
  },
  adRate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    comment: 'Rate used for calculation at time of transaction',
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ETH',
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('DEPOSIT', 'TRANSFER', 'WITHDRAWAL'),
    allowNull: false,
    defaultValue: 'DEPOSIT',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  blockNumber: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  gasUsed: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  gasPrice: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional transaction metadata',
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

module.exports = Transaction;