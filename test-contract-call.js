// Simple test to check contract function call
const { createPublicClient, http } = require('viem');

async function testContract() {
  console.log("Testing contract call...");

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

    const contractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

    // Test if contract exists
    console.log("Checking contract code...");
    const code = await publicClient.getCode({ address: contractAddress });
    console.log("Contract code:", code);
    console.log("Contract exists:", code !== '0x');

    if (code === '0x') {
      throw new Error("Contract does not exist at this address");
    }

    // Test getAllStatistics function
    console.log("Testing getAllStatistics...");
    const stats = await publicClient.readContract({
      address: contractAddress,
      abi: [
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
        }
      ],
      functionName: 'getAllStatistics',
    });

    console.log("Statistics:", stats);
    console.log("✅ Contract call successful!");

  } catch (error) {
    console.error("❌ Contract call failed:", error.message);
    console.error("Full error:", error);
  }
}

testContract();
