// Test script to simulate the frontend contract call
const { ethers } = require("hardhat");

async function main() {
  console.log("Testing contract call similar to frontend...");

  // Get the deployed contract
  const IncomeSurvey = await ethers.getContractAt("IncomeSurveySimple", "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853");
  console.log("Contract address:", IncomeSurvey.address);

  try {
    // Get a signer
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Submit a survey first
    console.log("Submitting survey with range 1...");
    const tx = await IncomeSurvey.connect(signer).submitSurvey(1);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("Transaction confirmed");

    // Test getting statistics using viem
    console.log("Testing getAllStatistics...");
    const { createPublicClient, http } = require('viem');
    const publicClient = createPublicClient({
      chain: { id: 31337, name: 'localhost', network: 'localhost', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['http://localhost:8545'] } } },
      transport: http('http://localhost:8545')
    });

    const stats = await publicClient.readContract({
      address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
      abi: require('../artifacts/contracts/IncomeSurveySimple.sol/IncomeSurveySimple.json').abi,
      functionName: 'getAllStatistics',
    });
    console.log("Statistics:", stats);

    // Check individual values
    console.log("Range 1 count:", stats[0].toString());
    console.log("Range 2 count:", stats[1].toString());
    console.log("Range 3 count:", stats[2].toString());

    console.log("✅ Contract call successful!");
  } catch (error) {
    console.error("❌ Contract call failed:", error.message);
    console.error("Full error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
