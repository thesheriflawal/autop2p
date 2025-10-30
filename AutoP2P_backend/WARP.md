# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install dependencies
  ```sh path=null start=null
  npm install
  ```
- Run (development)
  ```sh path=null start=null
  npm run dev
  ```
- Run (production)
  ```sh path=null start=null
  npm start
  ```
- Create/drop database (PostgreSQL)
  ```sh path=null start=null
  npm run db:create
  npm run db:drop
  ```
- One-time DB setup via SQL (creates user/privileges; requires local postgres superuser)
  ```sh path=null start=null
  npm run db:setup
  ```
- Test DB connectivity and permissions
  ```sh path=null start=null
  npm run db:test
  ```
- Run a single test script (no formal test runner configured)
  ```sh path=null start=null
  node test/merchant-service-test.js
  node test/withdrawal-test.js
  ```
- Run all ad‑hoc tests in test/
  ```sh path=null start=null
  for f in test/*.js; do node "$f"; done
  ```
- Run Sequelize migrations (uses config/config.json)
  ```sh path=null start=null
  npx sequelize-cli db:migrate
  npx sequelize-cli db:migrate:undo
  npx sequelize-cli migration:generate --name <meaningful-name>
  ```
- API docs (Swagger UI)
  - After the server starts, open http://localhost:3000/docs

## Architecture overview

- Entry & lifecycle
  - server.js boots src/app.js (AirP2PApp). AirP2PApp.start() sets up middleware, routes, error handling; connects to Postgres; optionally starts the blockchain event listener unless AUTO_START_LISTENER=false.
- HTTP layer
  - Express 5 app with helmet, cors, morgan. Routes are mounted at /api via src/routes/index.js and organized by domain: merchants.js, transactions.js, webhooks.js, ads.js, payments.js. Controllers in src/controllers/* translate requests to service calls and shape responses.
- Domain services
  - src/services/eventListener.js polls for TradeCreated logs via viem using src/config/blockchain.js and forwards events to depositService.
  - src/services/depositService.js persists transactions, computes merchant payout using merchantService.calculateAmount, triggers paymentService.sendFunds, and updates merchant balance.
  - src/services/paymentService.js integrates with an external payments API (axios). If PAYMENT API env is missing, it falls back to a deterministic mock; ensure access tokens via getAccessToken()/ensureAccessToken.
  - src/services/merchantService.js encapsulates merchant CRUD, rates, balances, withdrawals, and stats consumed by controllers and deposit pipeline.
- Data layer
  - Sequelize is used directly in src/config/database.js and src/models/*.js (Merchant, Transaction, User, Withdrawal, Ad) with relationships wired in src/models/index.js.
  - A separate Sequelize CLI scaffold exists in root models/ and migrations/ using config/config.json. Use CLI only for migration generation/execution; runtime models live in src/models.
- Configuration & docs
  - Env-driven configuration in .env (see .env.example). Swagger is configured in src/config/swagger.js and exposed at /docs, documenting /api endpoints and schemas.
- Logging & ops
  - src/utils/logger.js wraps winston to write console (non-prod) and logs/*.log files. Global error handling, request logging, and graceful shutdown are built into AirP2PApp.

## Important notes

- Environment variables
  - Database and server settings are read from .env by src/config/database.js (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_SSL, PORT, NODE_ENV). The event listener uses blockchain vars from src/config/blockchain.js (e.g., RPC_URL, CONTRACT_ADDRESS, CHAIN_ID, PRIVATE_KEY).
  - paymentService expects TOKEN, CLIENT_ID, ACCOUNT_ID for auth, while .env.example lists PAYMENT_API_KEY/…; align env names with the code or update the service/env to be consistent.
- Event listener
  - Auto-starts on boot; set AUTO_START_LISTENER=false to disable. You can control it via endpoints exposed under /api/transactions (status/start/stop).
- Tooling
  - No lint/type-check or formal test runner is configured in this repo. Tests in test/*.js are executable Node scripts.
