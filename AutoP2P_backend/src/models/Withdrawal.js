const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Withdrawal = sequelize.define('Withdrawal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Merchants',
      key: 'id'
    },
    comment: 'Reference to the merchant making the withdrawal',
  },
  withdrawalRef: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique withdrawal reference number',
  },
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    validate: {
      min: 0,
    },
    comment: 'Withdrawal amount',
  },
  previousBalance: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Merchant balance before withdrawal',
  },
  newBalance: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    comment: 'Merchant balance after withdrawal',
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Current status of the withdrawal',
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the recipient bank',
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Bank account number',
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Bank account holder name',
  },
  narration: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Withdrawal description or narration',
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ETH',
    allowNull: false,
    comment: 'Currency type',
  },
  processingFee: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    comment: 'Fee charged for processing the withdrawal',
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External payment system reference (e.g., bank transfer reference)',
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for withdrawal failure if status is failed',
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the withdrawal was requested',
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the withdrawal was processed/completed',
  },
  approvedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Admin or system that approved the withdrawal',
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Additional withdrawal metadata (IP address, device info, etc.)',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'withdrawals',
  timestamps: true,
  indexes: [
    {
      fields: ['merchantId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['withdrawalRef']
    },
    {
      fields: ['requestedAt']
    },
    {
      fields: ['merchantId', 'status']
    },
    {
      fields: ['merchantId', 'requestedAt']
    }
  ]
});

module.exports = Withdrawal;