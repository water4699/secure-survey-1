const { ethers } = require('ethers');

// Sepolia RPC URL and contract details
const SEPOLIA_RPC = 'https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990';
const CONTRACT_ADDRESS = '0x347B6b26297f8EDF02429087b3Dc0450191F70C2';

// Simplified ABI for Sepolia contract
const ABI = [
  {
    "inputs": [],
    "name": "getAllStatistics",
    "outputs": [
      {"internalType": "uint256", "name": "range1Count", "type": "uint256"},
      {"internalType": "uint256", "name": "range2Count", "type": "uint256"},
      {"internalType": "uint256", "name": "range3Count", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalParticipants",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint8", "name": "_incomeRange", "type": "uint8"}],
    "name": "submitSurvey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hasSurveyResponse",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function testSepoliaContract() {
  try {
    console.log('Testing Sepolia contract...');

    // Create provider
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    // Test reading functions
    console.log('Contract address:', CONTRACT_ADDRESS);

    const owner = await contract.owner();
    console.log('Contract owner:', owner);

    const totalParticipants = await contract.totalParticipants();
    console.log('Total participants:', totalParticipants.toString());

    const stats = await contract.getAllStatistics();
    console.log('Statistics:', {
      range1: stats[0].toString(),
      range2: stats[1].toString(),
      range3: stats[2].toString()
    });

    console.log('✅ Sepolia contract test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing Sepolia contract:', error.message);
  }
}

testSepoliaContract();
