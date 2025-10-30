const { createPublicClient, createWalletClient, http } = require("viem");
const { mainnet, sepolia, polygon, base, liskSepolia } = require("viem/chains");
const { privateKeyToAccount } = require("viem/accounts");
require("dotenv").config();

// Chain mapping
const chainMapping = {
  1: mainnet,
  11155111: sepolia,
  137: polygon,
  8453: base,
  4202: liskSepolia,
};

const getChain = () => {
  const chainId = parseInt(process.env.CHAIN_ID) || 1;
  return chainMapping[chainId] || mainnet;
};

const publicClient = createPublicClient({
  chain: getChain(),
  transport: http(process.env.RPC_URL),
});

const walletClient = process.env.PRIVATE_KEY
  ? createWalletClient({
      chain: getChain(),
      transport: http(process.env.RPC_URL),
      account: privateKeyToAccount(process.env.PRIVATE_KEY),
    })
  : null;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Contract ABI - Update this with your actual contract ABI
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "AdminAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "AdminRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tradeId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "DisputeRaised",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tradeId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "resolver",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "buyerWins", type: "bool" },
      {
        indexed: false,
        internalType: "string",
        name: "resolution",
        type: "string",
      },
    ],
    name: "DisputeResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tradeId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "PaymentConfirmed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PlatformFeesWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tradeId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "refundAmount",
        type: "uint256",
      },
    ],
    name: "TradeCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tradeId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "merchantId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "platformFee",
        type: "uint256",
      },
    ],
    name: "TradeCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tradeId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "merchantId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "accountName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "accountNumber",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "bankCode",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "adId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "TradeCreated",
    type: "event",
  },
  {
    inputs: [],
    name: "DISPUTE_TIMEOUT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FEE_DENOMINATOR",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PLATFORM_FEE_RATE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_admin", type: "address" }],
    name: "addAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "admins",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_tradeId", type: "uint256" },
      { internalType: "address", name: "_caller", type: "address" },
    ],
    name: "canRaiseDispute",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tradeId", type: "uint256" }],
    name: "completeTrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_merchantId", type: "uint256" },
      { internalType: "address", name: "_merchantAddress", type: "address" },
      { internalType: "uint256", name: "_adId", type: "uint256" },
      { internalType: "string", name: "_accountName", type: "string" },
      { internalType: "string", name: "_accountNumber", type: "string" },
      { internalType: "string", name: "_bankCode", type: "string" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "createTrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_merchantId", type: "uint256" }],
    name: "getMerchantTrades",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tradeId", type: "uint256" }],
    name: "getTrade",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "tradeId", type: "uint256" },
          { internalType: "address", name: "buyer", type: "address" },
          { internalType: "uint256", name: "merchantId", type: "uint256" },
          { internalType: "address", name: "merchantAddress", type: "address" },
          { internalType: "string", name: "accountName", type: "string" },
          { internalType: "string", name: "accountNumber", type: "string" },
          { internalType: "string", name: "bankCode", type: "string" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "depositTime", type: "uint256" },
          { internalType: "uint256", name: "paymentTime", type: "uint256" },
          {
            internalType: "enum AutoP2P.TradeStatus",
            name: "status",
            type: "uint8",
          },
          { internalType: "bool", name: "disputed", type: "bool" },
          {
            internalType: "address",
            name: "disputeInitiator",
            type: "address",
          },
        ],
        internalType: "struct AutoP2P.Trade",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTradeCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserTrades",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_address", type: "address" }],
    name: "isAdmin",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "merchantTrades",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_tradeId", type: "uint256" },
      { internalType: "string", name: "_reason", type: "string" },
    ],
    name: "raiseDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tradeId", type: "uint256" }],
    name: "releaseFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_admin", type: "address" }],
    name: "removeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_tradeId", type: "uint256" },
      { internalType: "bool", name: "_buyerWins", type: "bool" },
      { internalType: "string", name: "_resolution", type: "string" },
    ],
    name: "resolveDispute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "trades",
    outputs: [
      { internalType: "uint256", name: "tradeId", type: "uint256" },
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "merchantId", type: "uint256" },
      { internalType: "address", name: "merchantAddress", type: "address" },
      { internalType: "string", name: "accountName", type: "string" },
      { internalType: "string", name: "accountNumber", type: "string" },
      { internalType: "string", name: "bankCode", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "depositTime", type: "uint256" },
      { internalType: "uint256", name: "paymentTime", type: "uint256" },
      {
        internalType: "enum AutoP2P.TradeStatus",
        name: "status",
        type: "uint8",
      },
      { internalType: "bool", name: "disputed", type: "bool" },
      { internalType: "address", name: "disputeInitiator", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "userTrades",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "withdrawPlatformFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

module.exports = {
  publicClient,
  walletClient,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  getChain,
};
