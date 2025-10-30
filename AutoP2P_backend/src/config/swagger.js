const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoP2P API',
      version: '1.0.0',
      description: 'A comprehensive P2P trading platform API for USDT trading with escrow and dispute resolution',
      contact: {
        name: 'AutoP2P Support',
        email: 'support@autop2p.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || '/',
        description: 'Development server'
      },
      {
        url: 'https://api.autop2p.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Merchants',
        description: 'Merchant management operations'
      },
      {
        name: 'Transactions',
        description: 'Transaction and deposit operations'
      },
      {
        name: 'System',
        description: 'System health and information'
      }
    ],
    components: {
      schemas: {
        Merchant: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique merchant identifier',
              example: 1
            },
            walletAddress: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              description: 'Ethereum wallet address',
              example: '0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1'
            },
            name: {
              type: 'string',
              minLength: 2,
              description: 'Merchant display name',
              example: 'Premium Crypto Exchange'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Merchant email address',
              example: 'merchant@example.com'
            },
            adRate: {
              type: 'string',
              description: 'Ad rate multiplier (decimal string)',
              example: '1.0500'
            },
            balance: {
              type: 'string',
              description: 'Current merchant balance',
              example: '1000.50000000'
            },
            currency: {
              type: 'string',
              enum: ['ETH', 'USDT', 'USDC', 'DAI', 'BTC'],
              description: 'Supported currency',
              example: 'USDT'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether merchant is active',
              example: true
            },
            minOrder: {
              type: 'string',
              description: 'Minimum order amount',
              example: '10.00000000'
            },
            maxOrder: {
              type: 'string',
              description: 'Maximum order amount',
              example: '1000.00000000'
            },
            paymentMethods: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Supported payment methods',
              example: ['Bank Transfer', 'PayPal', 'Credit Card']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2024-01-20T14:45:00.000Z'
            }
          },
          required: ['id', 'walletAddress', 'name', 'adRate', 'currency']
        },
        MerchantCreateRequest: {
          type: 'object',
          properties: {
            walletAddress: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              description: 'Ethereum wallet address',
              example: '0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1'
            },
            name: {
              type: 'string',
              minLength: 2,
              description: 'Merchant display name',
              example: 'Premium Crypto Exchange'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Merchant email address',
              example: 'merchant@example.com'
            },
            currency: {
              type: 'string',
              enum: ['ETH', 'USDT', 'USDC', 'DAI', 'BTC'],
              description: 'Supported currency',
              example: 'USDT'
            },
            paymentMethods: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Supported payment methods',
              example: ['Bank Transfer', 'PayPal']
            }
          },
          required: ['walletAddress', 'name', 'email']
        },
        MerchantUpdateRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              description: 'Merchant display name',
              example: 'Updated Merchant Name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Merchant email address',
              example: 'updated@example.com'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether merchant is active',
              example: true
            },
            walletAddress: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              description: 'Ethereum wallet address',
              example: '0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1'
            },
            adRate: {
              type: 'number',
              minimum: 0,
              maximum: 10,
              exclusiveMinimum: true,
              description: 'Ad rate multiplier',
              example: 1.05
            },
            currency: {
              type: 'string',
              enum: ['ETH', 'USDT', 'USDC', 'DAI', 'BTC'],
              description: 'Supported currency',
              example: 'USDT'
            },
            minOrder: {
              type: 'number',
              minimum: 0,
              description: 'Minimum order amount',
              example: 10
            },
            maxOrder: {
              type: 'number',
              minimum: 0,
              description: 'Maximum order amount',
              example: 1000
            },
            paymentMethods: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Supported payment methods',
              example: ['Bank Transfer', 'PayPal', 'Credit Card']
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Transaction ID',
              example: 1
            },
            merchantId: {
              type: 'integer',
              description: 'Associated merchant ID',
              example: 1
            },
            userAddress: {
              type: 'string',
              description: 'User wallet address',
              example: '0x123...'
            },
            amount: {
              type: 'string',
              description: 'Transaction amount',
              example: '100.000000'
            },
            status: {
              type: 'string',
              description: 'Transaction status',
              example: 'completed'
            },
            txHash: {
              type: 'string',
              description: 'Blockchain transaction hash',
              example: '0xabc123...'
            }
          }
        },
        PaginatedMerchantsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Merchants retrieved successfully'
            },
            data: {
              type: 'object',
              properties: {
                merchants: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Merchant'
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    currentPage: {
                      type: 'integer',
                      example: 1
                    },
                    totalPages: {
                      type: 'integer',
                      example: 5
                    },
                    totalItems: {
                      type: 'integer',
                      example: 50
                    },
                    itemsPerPage: {
                      type: 'integer',
                      example: 20
                    },
                    hasNextPage: {
                      type: 'boolean',
                      example: true
                    },
                    hasPreviousPage: {
                      type: 'boolean',
                      example: false
                    },
                    nextPage: {
                      type: 'integer',
                      nullable: true,
                      example: 2
                    },
                    previousPage: {
                      type: 'integer',
                      nullable: true,
                      example: null
                    }
                  }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message description'
            }
          }
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'No valid fields provided. Updatable fields are: name, email, adRate, currency, minOrder, maxOrder, paymentMethods'
            },
            providedFields: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['invalidField']
            },
            updatableFields: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['name', 'email', 'adRate', 'currency', 'minOrder', 'maxOrder', 'paymentMethods']
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'AirP2P Backend is running'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            environment: {
              type: 'string',
              example: 'development'
            }
          }
        }
      },
      parameters: {
        MerchantId: {
          name: 'merchantId',
          in: 'path',
          required: true,
          description: 'Merchant ID',
          schema: {
            type: 'integer',
            minimum: 1
          },
          example: 1
        },
        WalletAddress: {
          name: 'walletAddress',
          in: 'path',
          required: true,
          description: 'Ethereum wallet address',
          schema: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$'
          },
          example: '0x742d35Cc6632C0532c3e4c0D2f69f8EC11fFd9D1'
        },
        Page: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          example: 1
        },
        Limit: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          example: 20
        },
        Currency: {
          name: 'currency',
          in: 'query',
          description: 'Filter by currency',
          schema: {
            type: 'string',
            enum: ['ETH', 'USDT', 'USDC', 'DAI', 'BTC']
          },
          example: 'USDT'
        },
        MinRate: {
          name: 'minRate',
          in: 'query',
          description: 'Minimum ad rate filter',
          schema: {
            type: 'number',
            minimum: 0
          },
          example: 1.0
        },
        MaxRate: {
          name: 'maxRate',
          in: 'query',
          description: 'Maximum ad rate filter',
          schema: {
            type: 'number',
            minimum: 0
          },
          example: 2.0
        },
        SortBy: {
          name: 'sortBy',
          in: 'query',
          description: 'Field to sort by',
          schema: {
            type: 'string',
            enum: ['createdAt', 'updatedAt', 'name', 'adRate', 'balance'],
            default: 'createdAt'
          },
          example: 'createdAt'
        },
        SortOrder: {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          schema: {
            type: 'string',
            enum: ['ASC', 'DESC'],
            default: 'DESC'
          },
          example: 'DESC'
        },
        Search: {
          name: 'search',
          in: 'query',
          description: 'Search merchants by name',
          schema: {
            type: 'string'
          },
          example: 'crypto'
        },
        HasBalance: {
          name: 'hasBalance',
          in: 'query',
          description: 'Filter merchants with balance > 0',
          schema: {
            type: 'boolean'
          },
          example: true
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad request - validation error or invalid parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './swagger-docs/*.yaml'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
  swaggerOptions: {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2
    }
  }
};