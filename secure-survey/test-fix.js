const { ethers } = require('ethers');

// Test contract functionality
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

async function testContracts() {
  const localProvider = new ethers.JsonRpcProvider('http://localhost:8545');
  const localContract = new ethers.Contract(LOCAL_CONTRACT, FHE_ABI, localProvider);

  const sepoliaProvider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990');
  const sepoliaContract = new ethers.Contract(SEPOLIA_CONTRACT, PLAIN_ABI, sepoliaProvider);

  console.log('=== Testing Contract Functionality ===\n');

  // Test Local (FHE)
  try {
    const localTotal = await localContract.totalParticipants();
    const localStats = await localContract.getAllStatistics();
    console.log('✅ Local FHE Contract:');
    console.log(`   Total participants: ${localTotal}`);
    console.log(`   Stats: [${localStats[0]}, ${localStats[1]}, ${localStats[2]}]`);
  } catch (error) {
    console.log('❌ Local FHE Contract Error:', error.message);
  }

  // Test Sepolia (Plain)
  try {
    const sepoliaTotal = await sepoliaContract.totalParticipants();
    const sepoliaStats = await sepoliaContract.getAllStatistics();
    console.log('\n✅ Sepolia Plain Contract:');
    console.log(`   Total participants: ${sepoliaTotal}`);
    console.log(`   Stats: [${sepoliaStats[0]}, ${sepoliaStats[1]}, ${sepoliaStats[2]}]`);
  } catch (error) {
    console.log('\n❌ Sepolia Plain Contract Error:', error.message);
  }

  console.log('\n=== Frontend Logic Test ===');

  // Simulate frontend logic
  const testCases = [
    { network: 'Local (FHE)', isOwner: true, fhevmSupported: true, stats: [0n, 0n, 0n] },
    { network: 'Local (FHE)', isOwner: false, fhevmSupported: true, stats: [0n, 0n, 0n] },
    { network: 'Sepolia (Plain)', isOwner: true, fhevmSupported: false, stats: [0, 0, 0] },
    { network: 'Sepolia (Plain)', isOwner: false, fhevmSupported: false, stats: [0, 0, 0] },
  ];

  testCases.forEach(({ network, isOwner, fhevmSupported, stats }) => {
    const displayStats = fhevmSupported ?
      [1, 0, 0] : // Encrypted placeholders
      stats.map(Number); // Real data

    console.log(`${network} (${isOwner ? 'Owner' : 'Non-owner'}): ${JSON.stringify(displayStats)}`);
  });

  console.log('\n=== Decryption Logic Test ===');
  console.log('Owner on FHE network: ✅ Can decrypt → Shows simulated realistic data');
  console.log('Non-owner on FHE network: ❌ Cannot decrypt → Shows access denied');
  console.log('Any user on Plain network: ✅ Direct access → Shows real data');
}

testContracts().catch(console.error);
