# AirP2P Backend

An automated P2P platform backend built with Node.js that listens for blockchain deposits, manages merchant rates, and processes automated fund transfers.

## 🚀 Features

- **Blockchain Event Listening**: Real-time monitoring of deposit events using Viem
- **Merchant Management**: Dynamic ad rates and balance tracking
- **Automated Processing**: Automatic calculation and fund transfer based on merchant rates
- **RESTful API**: Complete API for frontend integration
- **Payment Integration**: External payment service integration
- **Database Management**: Sequelize ORM with MySQL support
- **Comprehensive Logging**: Winston-based logging system
- **Error Handling**: Graceful error handling and recovery

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Blockchain    │───▶│   Event Listener │───▶│  Deposit Service │
│   (Smart        │    │     (Viem)       │    │                 │
│   Contract)     │    └──────────────────┘    └─────────────────┘
└─────────────────┘                                      │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Payment API   │◀───│ Payment Service  │◀───│ Merchant Service │
│   (External)    │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────┐
                                              │    Database     │
                                              │  (PostgreSQL)   │
                                              └─────────────────┘
```

## 🔧 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Blockchain**: Viem for Ethereum interaction
- **Logging**: Winston
- **Security**: Helmet, CORS
- **Environment**: dotenv

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- RPC endpoint for blockchain connection

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd AirP2P_backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**:
   
   **Install PostgreSQL** (if not already installed):
   ```bash
   # Ubuntu/Debian/Pop!_OS
   sudo apt update
   sudo apt install postgresql postgresql-contrib postgresql-server-dev-all
   ```
   
   **Create database and user**:
   ```bash
   # Quick setup using npm scripts
   npm run db:create
   
   # Or manual setup
   sudo -u postgres createdb airp2p_db
   sudo -u postgres psql -c "CREATE USER airp2p_user WITH PASSWORD 'your_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE airp2p_db TO airp2p_user;"
   ```
   
   **See detailed setup guide**: [`docs/postgresql-setup.md`](./docs/postgresql-setup.md)

4. **Start the server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=airp2p_db
DB_SSL=false

# Blockchain Configuration
RPC_URL=https://your-rpc-endpoint
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0x...
CHAIN_ID=1

# API Keys and External Services
PAYMENT_API_URL=https://api.example.com
PAYMENT_API_KEY=your_payment_api_key

# Optional Configuration
AUTO_START_LISTENER=true
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
LOG_LEVEL=info
```

## 📡 API Endpoints

### System

- `GET /` - API documentation
- `GET /api/health` - Health check

### Merchants

- `POST /api/merchants` - Create merchant
- `GET /api/merchants/:walletAddress` - Get merchant details
- `GET /api/merchants/:walletAddress/rate` - Get merchant rate
- `PUT /api/merchants/:merchantId/rate` - Update merchant rate
- `GET /api/merchants/:merchantId/stats` - Get merchant statistics
- `GET /api/merchants/:merchantId/transactions` - Get merchant transactions

### Transactions

- `GET /api/transactions/:txHash` - Get transaction details
- `GET /api/transactions/user/:walletAddress` - Get user transactions
- `POST /api/transactions/process` - Manual deposit processing (testing)

### Event Listener Management

- `GET /api/transactions/listener/status` - Get listener status
- `POST /api/transactions/listener/start` - Start event listener
- `POST /api/transactions/listener/stop` - Stop event listener

### Payment Service

- `GET /api/transactions/payment/:paymentId/status` - Check payment status
- `GET /api/transactions/payment/history` - Get payment history
- `GET /api/transactions/payment/config/test` - Test payment configuration

## 🔄 How It Works

### 1. Deposit Detection
```javascript
// Event listener detects deposits from smart contract
const unwatch = publicClient.watchContractEvent({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  eventName: 'Deposit',
  onLogs: handleDepositEvent
});
```

### 2. Rate Calculation
```javascript
// Calculate payout based on merchant's ad rate
const calculatedAmount = depositAmount * merchantRate;
```

### 3. Payment Processing
```javascript
// Send funds via payment API
const paymentResult = await paymentService.sendFunds({
  recipientAddress: userWallet,
  amount: calculatedAmount,
  currency: 'ETH'
});
```

### 4. Balance Update
```javascript
// Update merchant balance
await merchantService.updateBalance(merchantId, calculatedAmount);
```

## 🧪 Testing

### Development Mode
In development mode without payment API configuration, the system uses mock payments for testing.

### Manual Testing
```bash
# Test deposit processing
curl -X POST http://localhost:3000/api/transactions/process \\
  -H "Content-Type: application/json" \\
  -d '{
    "txHash": "0x123...",
    "fromAddress": "0xabc...",
    "toAddress": "0xdef...",
    "amount": "1000000000000000000"
  }'
```

## 📊 Database Schema

### Users
- `id` (UUID, Primary Key)
- `walletAddress` (String, Unique)
- `email` (String, Optional)
- `username` (String, Optional)
- `isActive` (Boolean)

### Merchants
- `id` (UUID, Primary Key)
- `walletAddress` (String, Unique)
- `name` (String)
- `adRate` (Decimal) - Rate multiplier (e.g., 1.05 for 5% premium)
- `balance` (Decimal) - Current balance
- `currency` (String)
- `isActive` (Boolean)

### Transactions
- `id` (UUID, Primary Key)
- `txHash` (String, Unique)
- `fromAddress` (String)
- `toAddress` (String)
- `merchantId` (UUID, Foreign Key)
- `userId` (UUID, Foreign Key)
- `amount` (Decimal) - Original amount
- `calculatedAmount` (Decimal) - Amount after rate calculation
- `adRate` (Decimal) - Rate used
- `status` (Enum: PENDING, CONFIRMED, FAILED, CANCELLED)
- `type` (Enum: DEPOSIT, TRANSFER, WITHDRAWAL)

## 🔒 Security

- **Input Validation**: All API inputs are validated
- **Ethereum Address Validation**: Built-in validation for wallet addresses
- **Rate Limiting**: Implement rate limiting in production
- **Environment Variables**: Sensitive data stored in environment variables
- **Error Handling**: Comprehensive error handling without information leakage

## 📝 Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Log levels: error, warn, info, http, verbose, debug, silly

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up proper logging
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure monitoring
7. Set up backup strategy

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email your-email@domain.com or create an issue in the repository.

## 🔮 Roadmap

- [ ] Add comprehensive test suite
- [ ] Implement rate limiting
- [ ] Add API authentication
- [ ] Support for multiple cryptocurrencies
- [ ] Add monitoring and metrics
- [ ] Implement caching layer
- [ ] Add webhook notifications