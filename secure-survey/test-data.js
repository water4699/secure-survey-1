const { ethers } = require('ethers');

// Test both networks
const LOCAL_RPC = 'http://localhost:8545';
const SEPOLIA_RPC = 'https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990';

const LOCAL_CONTRACT = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const SEPOLIA_CONTRACT = '0x347B6b26297f8EDF02429087b3Dc0450191F70C2';

const FHE_ABI = [
  {
    "inputs": [],
    "name": "getAllStatistics",
    "outputs": [
      {"internalType": "euint32", "name": "range1Count", "type": "bytes32"},
      {"internalType": "euint32", "name": "range2Count", "type": "bytes32"},
      {"internalType": "euint32", "name": "range3Count", "type": "bytes32"}
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
  }
];

const PLAIN_ABI = [
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
  }
];

async function testNetwork(name, rpc, contractAddress, abi) {
  try {
    console.log(`\n=== Testing ${name} ===`);
    const provider = new ethers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const totalParticipants = await contract.totalParticipants();
    console.log(`Total participants: ${totalParticipants}`);

    const stats = await contract.getAllStatistics();
    console.log(`Statistics: [${stats[0]}, ${stats[1]}, ${stats[2]}]`);

  } catch (error) {
    console.error(`Error testing ${name}:`, error.message);
  }
}

async function main() {
  await testNetwork('Localhost (FHE)', LOCAL_RPC, LOCAL_CONTRACT, FHE_ABI);
  await testNetwork('Sepolia (Plain)', SEPOLIA_RPC, SEPOLIA_CONTRACT, PLAIN_ABI);
}

main();
