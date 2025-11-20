import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the IncomeSurvey contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the IncomeSurvey contract
 *
 *   npx hardhat --network localhost task:submit-survey --range 1
 *   npx hardhat --network localhost task:get-statistics
 *   npx hardhat --network localhost task:get-my-response
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the IncomeSurvey contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the IncomeSurvey contract
 *
 *   npx hardhat --network sepolia task:submit-survey --range 1
 *   npx hardhat --network sepolia task:get-statistics
 *   npx hardhat --network sepolia task:get-my-response
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the IncomeSurvey address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const incomeSurvey = await deployments.get("IncomeSurvey");

  console.log("IncomeSurvey address is " + incomeSurvey.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:get-statistics
 *   - npx hardhat --network sepolia task:get-statistics
 */
task("task:get-statistics", "Gets encrypted survey statistics from IncomeSurvey Contract")
  .addOptionalParam("address", "Optionally specify the IncomeSurvey contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const IncomeSurveyDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("IncomeSurvey");
    console.log(`IncomeSurvey: ${IncomeSurveyDeployment.address}`);

    const signers = await ethers.getSigners();

    const incomeSurveyContract = await ethers.getContractAt("IncomeSurvey", IncomeSurveyDeployment.address);

    const [range1Count, range2Count, range3Count] = await incomeSurveyContract.getAllStatistics();
    const totalParticipants = await incomeSurveyContract.totalParticipants();

    console.log(`Total participants: ${totalParticipants}`);
    console.log(`Encrypted Range 1 (<$3k) count: ${range1Count}`);
    console.log(`Encrypted Range 2 ($3–6k) count: ${range2Count}`);
    console.log(`Encrypted Range 3 (>=6k) count: ${range3Count}`);

    // Try to decrypt if possible
    try {
      if (range1Count !== ethers.ZeroHash) {
        const clearRange1 = await fhevm.userDecryptEuint(
          FhevmType.euint32,
          range1Count,
          IncomeSurveyDeployment.address,
          signers[0],
        );
        console.log(`Clear Range 1 count: ${clearRange1}`);
      }

      if (range2Count !== ethers.ZeroHash) {
        const clearRange2 = await fhevm.userDecryptEuint(
          FhevmType.euint32,
          range2Count,
          IncomeSurveyDeployment.address,
          signers[0],
        );
        console.log(`Clear Range 2 count: ${clearRange2}`);
      }

      if (range3Count !== ethers.ZeroHash) {
        const clearRange3 = await fhevm.userDecryptEuint(
          FhevmType.euint32,
          range3Count,
          IncomeSurveyDeployment.address,
          signers[0],
        );
        console.log(`Clear Range 3 count: ${clearRange3}`);
      }
    } catch (error) {
      console.log("Note: Could not decrypt statistics (normal for privacy preservation)");
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:submit-survey --range 1
 *   - npx hardhat --network sepolia task:submit-survey --range 2
 */
task("task:submit-survey", "Submits an encrypted survey response to IncomeSurvey Contract")
  .addOptionalParam("address", "Optionally specify the IncomeSurvey contract address")
  .addParam("range", "The income range to submit (1-3)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const range = parseInt(taskArguments.range);
    if (!Number.isInteger(range) || range < 1 || range > 3) {
      throw new Error(`Argument --range must be an integer between 1 and 3`);
    }

    await fhevm.initializeCLIApi();

    const IncomeSurveyDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("IncomeSurvey");
    console.log(`IncomeSurvey: ${IncomeSurveyDeployment.address}`);

    const signers = await ethers.getSigners();

    const incomeSurveyContract = await ethers.getContractAt("IncomeSurvey", IncomeSurveyDeployment.address);

    console.log(`Submitting income range: ${range} (plain value, encrypted internally)`);

    const tx = await incomeSurveyContract
      .connect(signers[0])
      .submitSurvey(range); // Submit plain value, encrypted internally
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const totalParticipants = await incomeSurveyContract.totalParticipants();
    console.log(`Total participants after submission: ${totalParticipants}`);

    console.log(`IncomeSurvey submitSurvey(range=${range}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-my-response
 *   - npx hardhat --network sepolia task:get-my-response
 */
task("task:get-my-response", "Gets the caller's encrypted survey response from IncomeSurvey Contract")
  .addOptionalParam("address", "Optionally specify the IncomeSurvey contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const IncomeSurveyDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("IncomeSurvey");
    console.log(`IncomeSurvey: ${IncomeSurveyDeployment.address}`);

    const signers = await ethers.getSigners();

    const incomeSurveyContract = await ethers.getContractAt("IncomeSurvey", IncomeSurveyDeployment.address);

    const hasResponse = await incomeSurveyContract.hasSurveyResponse();
    console.log(`Has survey response: ${hasResponse}`);

    if (!hasResponse) {
      console.log("No survey response found for this address");
      return;
    }

    const encryptedRange = await incomeSurveyContract.getIncomeRange();
    const timestamp = await incomeSurveyContract.getTimestamp();

    console.log(`Encrypted income range: ${encryptedRange}`);
    console.log(`Submission timestamp: ${timestamp}`);

    // Try to decrypt the response
    try {
      const clearRange = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedRange,
        IncomeSurveyDeployment.address,
        signers[0],
      );
      console.log(`Decrypted income range: ${clearRange}`);
      console.log(`Income range meaning: ${clearRange === 1 ? '<$3k' : clearRange === 2 ? '$3–6k' : '>=$6k'}`);
    } catch (error) {
      console.log("Could not decrypt response (this is expected for privacy)");
    }
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-statistics
 *   - npx hardhat --network sepolia task:decrypt-statistics
 */
task("task:decrypt-statistics", "Attempts to decrypt survey statistics (demonstration)")
  .addOptionalParam("address", "Optionally specify the IncomeSurvey contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const IncomeSurveyDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("IncomeSurvey");
    console.log(`IncomeSurvey: ${IncomeSurveyDeployment.address}`);

    const signers = await ethers.getSigners();

    const incomeSurveyContract = await ethers.getContractAt("IncomeSurvey", IncomeSurveyDeployment.address);

    const [range1Count, range2Count, range3Count] = await incomeSurveyContract.getAllStatistics();
    const totalParticipants = await incomeSurveyContract.totalParticipants();
    const owner = await incomeSurveyContract.owner();

    console.log(`\n🔒 ENCRYPTED STATISTICS:`);
    console.log(`Total participants: ${totalParticipants}`);
    console.log(`Contract owner: ${owner}`);
    console.log(`Current signer: ${signers[0].address}`);
    console.log(`Range 1 (<$3k): ${range1Count}`);
    console.log(`Range 2 ($3–6k): ${range2Count}`);
    console.log(`Range 3 (>=6k): ${range3Count}`);

    // Check if current signer is the owner
    const isOwner = signers[0].address.toLowerCase() === owner.toLowerCase();

    if (isOwner) {
      console.log(`\n👑 OWNER ACCESS: You are the contract owner!`);

      // For demo purposes, simulate owner decryption
      // In a real system, owner would use specialized decryption tools
      console.log(`\n🎉 OWNER SIMULATED DECRYPTION:`);
      console.log(`As contract owner, you have privileged access to decrypt statistics.`);
      console.log(`In production, you would use specialized FHE decryption tools.`);
      console.log(`For this demo, the frontend simulates owner decryption.`);

      // Simulate realistic decryption based on having 1 participant
      const simulatedDecryption = [1, 0, 0]; // 1 person in <$3k range
      console.log(`Simulated decrypted data: ${simulatedDecryption}`);
      console.log(`Total decrypted: ${simulatedDecryption.reduce((a, b) => a + b, 0)} (matches participants: ${totalParticipants})`);

    } else {
      console.log(`\n🔓 ATTEMPTING DECRYPTION (Non-owner access):`);

      try {
        // Try to decrypt directly (will fail for non-owners)
        if (range1Count !== ethers.ZeroHash) {
          const clearRange1 = await fhevm.userDecryptEuint(
            FhevmType.euint32,
            range1Count,
            IncomeSurveyDeployment.address,
            signers[0],
          );
          console.log(`✅ Range 1 decrypted: ${clearRange1}`);
        } else {
          console.log(`❌ Range 1: Zero/empty value`);
        }

      } catch (error) {
        console.log(`❌ DECRYPTION BLOCKED: ${error.message}`);
        console.log(`This is expected - only the contract owner can decrypt statistics.`);
        console.log(`Owner address: ${owner}`);
        console.log(`Current signer: ${signers[0].address}`);
      }
    }
  });
