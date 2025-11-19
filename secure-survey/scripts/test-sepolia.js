// Test Sepolia contract functionality
const { ethers } = require("hardhat");

async function main() {
  console.log("Testing Sepolia contract...");

  // Use the deployed Sepolia contract address
  const contractAddress = "0xf134d704EB207C2b2a93c24c6AA42d57e1A22A41";

  try {
    // Get the IncomeSurveySepolia contract
    const IncomeSurveySepolia = await ethers.getContractAt("IncomeSurveySepolia", contractAddress);
    console.log("Contract address:", IncomeSurveySepolia.address);

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Check total participants
    const totalParticipants = await IncomeSurveySepolia.totalParticipants();
    console.log("Total participants:", totalParticipants.toString());

    // Test submitSurvey function
    console.log("Testing submitSurvey(2)...");
    const tx = await IncomeSurveySepolia.connect(signer).submitSurvey(2);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.status);

    // Check total participants after submission
    const newTotal = await IncomeSurveySepolia.totalParticipants();
    console.log("New total participants:", newTotal.toString());

    console.log("✅ Sepolia contract test successful!");

  } catch (error) {
    console.error("❌ Sepolia contract test failed:", error.message);
    console.error("Full error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
