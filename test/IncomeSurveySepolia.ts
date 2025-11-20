import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { IncomeSurvey } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("IncomeSurveySepolia", function () {
  let signers: Signers;
  let incomeSurveyContract: IncomeSurvey;
  let incomeSurveyContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const IncomeSurveyDeployment = await deployments.get("IncomeSurvey");
      incomeSurveyContractAddress = IncomeSurveyDeployment.address;
      incomeSurveyContract = await ethers.getContractAt("IncomeSurvey", IncomeSurveyDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0], bob: ethSigners[1] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should submit income survey response", async function () {
    steps = 8;

    this.timeout(4 * 40000);

    progress("Checking initial statistics...");
    const initialTotalParticipants = await incomeSurveyContract.totalParticipants();
    progress(`Initial total participants: ${initialTotalParticipants}`);

    progress("Encrypting income range '2' ($3–6k)...");
    const encryptedRange = await fhevm
      .createEncryptedInput(incomeSurveyContractAddress, signers.alice.address)
      .add32(2)
      .encrypt();

    progress(
      `Submitting survey response to IncomeSurvey=${incomeSurveyContractAddress} handle=${ethers.hexlify(encryptedRange.handles[0])} signer=${signers.alice.address}...`,
    );
    const tx = await incomeSurveyContract
      .connect(signers.alice)
      .submitSurvey(encryptedRange.handles[0], encryptedRange.inputProof);
    await tx.wait();

    progress(`Call IncomeSurvey.totalParticipants()...`);
    const totalParticipants = await incomeSurveyContract.totalParticipants();
    progress(`Total participants: ${totalParticipants}`);

    progress(`Call IncomeSurvey.getAllStatistics()...`);
    const [range1Count, range2Count, range3Count] = await incomeSurveyContract.getAllStatistics();
    progress(`Encrypted Range 1 count: ${range1Count}`);
    progress(`Encrypted Range 2 count: ${range2Count}`);
    progress(`Encrypted Range 3 count: ${range3Count}`);

    // Check that statistics are not zero
    expect(range2Count).to.not.eq(ethers.ZeroHash);

    progress(`Checking if user has survey response...`);
    const hasResponse = await incomeSurveyContract.connect(signers.alice).hasSurveyResponse();
    progress(`Has survey response: ${hasResponse}`);
    expect(hasResponse).to.be.true;

    progress(`Call IncomeSurvey.getIncomeRange()...`);
    const encryptedResponse = await incomeSurveyContract.connect(signers.alice).getIncomeRange();

    progress(`Decrypting IncomeSurvey.getIncomeRange()=${encryptedResponse}...`);
    const clearResponse = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedResponse,
      incomeSurveyContractAddress,
      signers.alice,
    );
    progress(`Decrypted income range: ${clearResponse}`);

    expect(clearResponse).to.eq(2); // Should be the range we submitted

    progress(`Call IncomeSurvey.getTimestamp()...`);
    const timestamp = await incomeSurveyContract.connect(signers.alice).getTimestamp();
    progress(`Submission timestamp: ${timestamp}`);
    expect(timestamp).to.be.gt(0);

    progress("Income survey submission and verification completed successfully!");
  });

  it("should handle multiple survey submissions", async function () {
    steps = 6;

    this.timeout(6 * 40000);

    // Get a second signer for this test
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    const bob = ethSigners[1];

    progress("Alice submitting range 1...");
    const encryptedRange1 = await fhevm
      .createEncryptedInput(incomeSurveyContractAddress, signers.alice.address)
      .add32(1)
      .encrypt();

    let tx = await incomeSurveyContract
      .connect(signers.alice)
      .submitSurvey(encryptedRange1.handles[0], encryptedRange1.inputProof);
    await tx.wait();

    progress("Alice submitting range 3 (second submission)...");
    const encryptedRange3 = await fhevm
      .createEncryptedInput(incomeSurveyContractAddress, signers.alice.address)
      .add32(3)
      .encrypt();

    tx = await incomeSurveyContract
      .connect(signers.alice)
      .submitSurvey(encryptedRange3.handles[0], encryptedRange3.inputProof);
    await tx.wait();

    progress("Checking final statistics...");
    const totalParticipants = await incomeSurveyContract.totalParticipants();
    const [range1Count, range2Count, range3Count] = await incomeSurveyContract.getAllStatistics();

    progress(`Final total participants: ${totalParticipants}`);
    progress(`Range 1 count: ${range1Count}`);
    progress(`Range 2 count: ${range2Count}`);
    progress(`Range 3 count: ${range3Count}`);

    expect(totalParticipants).to.be.gte(1); // Same user submitting multiple times doesn't increase participant count
    expect(range1Count).to.not.eq(ethers.ZeroHash);
    expect(range3Count).to.not.eq(ethers.ZeroHash);

    progress("Multiple survey submissions test completed!");
  });
});
