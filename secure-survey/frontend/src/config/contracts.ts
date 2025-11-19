// IncomeSurvey contract configuration
export const CONTRACT_ADDRESSES = {
  // Localhost deployment (chainId: 31337) - Simple contract (no FHE)
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  // Sepolia deployment (chainId: 11155111) - Plain contract (no FHE)
  11155111: '0xf134d704EB207C2b2a93c24c6AA42d57e1A22A41',
} as const;

export const getContractAddress = (chainId: number): string => {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!address) {
    throw new Error(`No contract deployed on network with chainId ${chainId}`);
  }
  return address;
};

// Check if network supports FHEVM
export const isFhevmSupported = (chainId: number): boolean => {
  return chainId === 31337 || chainId === 11155111; // Both localhost and Sepolia support FHE
};

// Get appropriate ABI (now both networks use the same ABI)
export const getContractABI = (chainId: number) => {
  return CONTRACT_ABI; // Both networks use the same FHE-enabled ABI
};

// Generated ABI from contract artifacts (simple contract version)
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "StatisticsUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "SurveySubmitted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getAllStatistics",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "range1Count",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "range2Count",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "range3Count",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getIncomeRange",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getParticipantAtIndex",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRange1Count",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRange2Count",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRange3Count",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimestamp",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hasSurveyResponse",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "_incomeRange",
          "type": "uint8"
        }
      ],
      "name": "submitSurvey",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
  {
    "inputs": [],
    "name": "totalParticipants",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

