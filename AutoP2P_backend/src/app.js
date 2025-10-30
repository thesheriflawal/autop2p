const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { connectDatabase } = require("./config/database");
const routes = require("./routes");
const eventListener = require("./services/eventListener");
const logger = require("./utils/logger");
const { swaggerUi, specs, swaggerOptions } = require('./config/swagger');
const { processPayment } = require("./services/depositService");
const { getAccessToken } = require("./services/paymentService");
const paymentService = require("./services/paymentService");

// Import models to establish relationships
require("./models");

class AirP2PApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(",")
          : "*",
        credentials: true,
      })
    );

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Logging middleware
    this.app.use(
      morgan("combined", {
        stream: {
          write: (message) => logger.http(message.trim()),
        },
      })
    );

    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        query: req.query,
        body: req.method !== "GET" ? req.body : undefined,
      });
      next();
    });
  }

  setupRoutes() {
    // Swagger documentation
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
    
    // API routes
    this.app.use("/api", routes);

    // Root route
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Welcome to AirP2P Backend API",
        version: "1.0.0",
        documentation: "/docs",
        apiInfo: "/api",
        health: "/api/health",
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Endpoint not found",
        path: req.originalUrl,
        method: req.method,
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error("Unhandled error:", {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
      });

      // Don't leak error details in production
      const message =
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message;

      res.status(error.status || 500).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
      });
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection: ", {promise,  reason});
      // Close server gracefully
      this.gracefulShutdown("unhandledRejection");
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", {error: error.message});
      // Close server gracefully
      this.gracefulShutdown("uncaughtException");
    });

    // Handle SIGTERM
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received");
      this.gracefulShutdown("SIGTERM");
    });

    // Handle SIGINT
    process.on("SIGINT", () => {
      logger.info("SIGINT received");
      this.gracefulShutdown("SIGINT");
    });
  }

  async initialize() {
    try {
      // Connect to database
      await connectDatabase();

      // Start event listener
      if (process.env.AUTO_START_LISTENER !== "false") {
        try {
          await eventListener.startListening();
          logger.info("✅ Event listener started automatically");
        } catch (error) {
          logger.warn(
            "⚠️  Event listener failed to start automatically:",
            {error: error.message}
          );
        }
      }

      logger.info("✅ Application initialized successfully");
     

    } catch (error) {
      logger.error("❌ Failed to initialize application:", {error: error.message});
      throw error;
    }
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, async (error) => {
        if (error) {
          logger.error("❌ Failed to start server:", {error: error.message});
          reject(error);
          return;
        }

        try {
          await this.initialize();

          logger.info(`🚀 AirP2P Backend server started successfully`);
          logger.info(`📍 Server running on port ${this.port}`);
          logger.info(
            `🌍 Environment: ${process.env.NODE_ENV || "development"}`
          );
          logger.info(
            `📚 Swagger Documentation: http://localhost:${this.port}/docs`
          );
          logger.info(
            `📖 API Info: http://localhost:${this.port}/api`
          );
          logger.info(
            `💚 Health Check: http://localhost:${this.port}/api/health`
          );

          resolve(this.server);
        } catch (initError) {
          logger.error("❌ Failed to initialize application:", {initError});
          reject(initError);
        }
      });
    });
  }

  gracefulShutdown(signal) {
    logger.info(`🛑 Graceful shutdown initiated by ${signal}`);

    if (this.server) {
      this.server.close(() => {
        logger.info("✅ HTTP server closed");

        // Stop event listener
        eventListener.stopListening();

        // Close database connection
        // Note: Sequelize automatically handles connection pooling

        logger.info("✅ Graceful shutdown completed");
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 30000);
    } else {
      process.exit(0);
    }
  }
}

// Create and export app instance
const airP2PApp = new AirP2PApp();

module.exports = airP2PApp;
