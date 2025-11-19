// Test current contract state
const { createPublicClient, http } = require('viem');

async function testContract() {
  console.log("Testing current contract state...");

  try {
    const publicClient = createPublicClient({
      chain: {
        id: 31337,
        name: 'localhost',
        network: 'localhost',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: ['http://localhost:8545'] } }
      },
      transport: http('http://localhost:8545')
    });

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Test if contract exists
    console.log("Checking contract code...");
    const code = await publicClient.getCode({ address: contractAddress });
    console.log("Contract code:", code);
    console.log("Contract exists:", code !== '0x');

    if (code === '0x') {
      throw new Error("Contract does not exist at this address");
    }

    // Test totalParticipants first
    console.log("Testing totalParticipants...");
    const totalParticipants = await publicClient.readContract({
      address: contractAddress,
      abi: [
        {
          "inputs": [],
          "name": "totalParticipants",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      functionName: 'totalParticipants',
    });
    console.log("Total participants:", totalParticipants.toString());

    // Test getAllStatistics
    console.log("Testing getAllStatistics...");
    const stats = await publicClient.readContract({
      address: contractAddress,
      abi: [
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
        }
      ],
      functionName: 'getAllStatistics',
    });

    console.log("Statistics:", stats);
    console.log("Range 1:", stats[0].toString());
    console.log("Range 2:", stats[1].toString());
    console.log("Range 3:", stats[2].toString());

    console.log("✅ All tests passed!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

testContract();
