const User = require('./User');
const Merchant = require('./Merchant');
const Transaction = require('./Transaction');
const Withdrawal = require('./Withdrawal');
const Ad = require('./Ad');

// Define relationships
Merchant.hasMany(Transaction, { foreignKey: 'merchantId', as: 'transactions' });
Transaction.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Withdrawal relationships
Merchant.hasMany(Withdrawal, { foreignKey: 'merchantId', as: 'withdrawals' });
Withdrawal.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

// Ad relationships
Merchant.hasMany(Ad, { foreignKey: 'merchantId', as: 'ads' });
Ad.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

module.exports = {
  User,
  Merchant,
  Transaction,
  Withdrawal,
  Ad,
};
