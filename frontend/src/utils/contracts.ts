export const PAYMENT_STREAM_ABI = [
  {
    "inputs": [
      { "name": "_usdt", "type": "address" },
      { "name": "_feeRecipient", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "duration", "type": "uint256" },
      { "name": "serviceId", "type": "string" }
    ],
    "name": "createStream",
    "outputs": [{ "name": "streamId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "streamId", "type": "bytes32" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "streamId", "type": "bytes32" }],
    "name": "cancelStream",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "streamId", "type": "bytes32" }],
    "name": "pauseStream",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "streamId", "type": "bytes32" }],
    "name": "resumeStream",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "streamId", "type": "bytes32" }],
    "name": "availableBalance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "streamId", "type": "bytes32" }],
    "name": "getStream",
    "outputs": [{
      "components": [
        { "name": "sender", "type": "address" },
        { "name": "recipient", "type": "address" },
        { "name": "depositAmount", "type": "uint256" },
        { "name": "withdrawnAmount", "type": "uint256" },
        { "name": "startTime", "type": "uint256" },
        { "name": "endTime", "type": "uint256" },
        { "name": "ratePerSecond", "type": "uint256" },
        { "name": "isActive", "type": "bool" },
        { "name": "serviceId", "type": "string" }
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "sender", "type": "address" }],
    "name": "getSenderStreams",
    "outputs": [{ "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "recipient", "type": "address" }],
    "name": "getRecipientStreams",
    "outputs": [{ "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "streamId", "type": "bytes32" },
      { "indexed": true, "name": "sender", "type": "address" },
      { "indexed": true, "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "startTime", "type": "uint256" },
      { "name": "endTime", "type": "uint256" },
      { "name": "serviceId", "type": "string" }
    ],
    "name": "StreamCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "streamId", "type": "bytes32" },
      { "indexed": true, "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "StreamWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "streamId", "type": "bytes32" },
      { "indexed": true, "name": "sender", "type": "address" },
      { "name": "remainingAmount", "type": "uint256" }
    ],
    "name": "StreamCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "streamId", "type": "bytes32" },
      { "indexed": true, "name": "recipient", "type": "address" },
      { "name": "finalAmount", "type": "uint256" }
    ],
    "name": "StreamCompleted",
    "type": "event"
  }
];

export const AGENT_WALLET_ABI = [
  {
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_operator", "type": "address" },
      { "name": "_usdt", "type": "address" },
      { "name": "_paymentStream", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "maxAmount", "type": "uint256" },
      { "name": "maxDuration", "type": "uint256" },
      { "name": "enabled", "type": "bool" }
    ],
    "name": "configureAutoStream",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "duration", "type": "uint256" }
    ],
    "name": "initiateStream",
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "sendPayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const BILLING_REGISTRY_ABI = [
  {
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "endpoint", "type": "string" },
      { "name": "billingType", "type": "uint8" },
      { "name": "rate", "type": "uint256" },
      { "name": "minDuration", "type": "uint256" },
      { "name": "maxDuration", "type": "uint256" },
      { "name": "tags", "type": "string[]" }
    ],
    "name": "registerService",
    "outputs": [{ "name": "serviceId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "serviceId", "type": "bytes32" }],
    "name": "getService",
    "outputs": [{
      "components": [
        { "name": "serviceId", "type": "bytes32" },
        { "name": "provider", "type": "address" },
        { "name": "name", "type": "string" },
        { "name": "description", "type": "string" },
        { "name": "endpoint", "type": "string" },
        { "name": "billingType", "type": "uint8" },
        { "name": "rate", "type": "uint256" },
        { "name": "minDuration", "type": "uint256" },
        { "name": "maxDuration", "type": "uint256" },
        { "name": "isActive", "type": "bool" },
        { "name": "totalEarned", "type": "uint256" },
        { "name": "totalRequests", "type": "uint256" },
        { "name": "ratingSum", "type": "uint256" },
        { "name": "ratingCount", "type": "uint256" },
        { "name": "tags", "type": "string[]" }
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "provider", "type": "address" }],
    "name": "getProviderServices",
    "outputs": [{ "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "keyword", "type": "string" }],
    "name": "searchServices",
    "outputs": [{ "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "serviceId", "type": "bytes32" },
      { "name": "rating", "type": "uint8" }
    ],
    "name": "rateService",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const USDT_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "sender", "type": "address" },
      { "name": "recipient", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const PAYMENT_STREAM_ADDRESS = (import.meta.env.VITE_PAYMENT_STREAM_ADDRESS || '0xDE900020CEA3F4ca1223a553D66179DF43f14Aa5') as `0x${string}`;